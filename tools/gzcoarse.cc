/*
 * Copyright 2014 Open Source Robotics Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/

#include <gts.h>
#include <gazebo/gazebo.hh>
#include <tinyxml.h>
#include <math.h>
#include "nanoflann.hpp"

#ifndef PI
#define PI 3.14159265359
#endif

void build_list (gpointer * data, GSList ** list)
{
  /* always use O(1) g_slist_prepend instead of O(n) g_slist_append */
  *list = g_slist_prepend (*list, data);
}

void triangle_cleanup (GtsSurface * s)
{
  GSList * triangles = NULL;
  GSList * i;

  g_return_if_fail (s != NULL);

  /* build list of triangles */
  gts_surface_foreach_face (s, (GtsFunc) build_list, &triangles);

  /* remove duplicate triangles */
  i = triangles;
  while (i) {
    GtsTriangle * t = (GtsTriangle*)i->data;
    if (gts_triangle_is_duplicate (t))
      /* destroy t, its edges (if not used by any other triangle)
	 and its corners (if not used by any other edge) */
      gts_object_destroy (GTS_OBJECT (t));
    i = i->next;
  }

  /* free list of triangles */
  g_slist_free (triangles);
}

//////////////////////////////////////////////////
// Custom data set for nanoflann
template <typename T>
struct PointCloud
{
	struct Point
	{
		T  x,y,z;
	};

	std::vector<Point>  pts;

	// Must return the number of data points
	inline long unsigned int kdtree_get_point_count() const { return pts.size(); }

	// Returns the distance between the vector "p1[0:size-1]" and the data point with index "idx_p2" stored in the class:
	inline T kdtree_distance(const T *p1, const long unsigned int idx_p2,long unsigned int size) const
	{
		const T d0=p1[0]-pts[idx_p2].x;
		const T d1=p1[1]-pts[idx_p2].y;
		const T d2=p1[2]-pts[idx_p2].z;
		return d0*d0+d1*d1+d2*d2;
	}

	// Returns the dim'th component of the idx'th point in the class:
	// Since this is inlined and the "dim" argument is typically an immediate value, the
	//  "if/else's" are actually solved at compile time.
	inline T kdtree_get_pt(const long unsigned int idx, int dim) const
	{
		if (dim==0) return pts[idx].x;
		else if (dim==1) return pts[idx].y;
		else return pts[idx].z;
	}

	// Optional bounding-box computation: return false to default to a standard bbox computation loop.
	//   Return true if the BBOX was already computed by the class and returned in "bb" so it can be avoided to redo it again.
	//   Look at bb.size() to find out the expected dimensionality (e.g. 2 or 3 for point clouds)
	template <class BBOX>
	bool kdtree_get_bbox(BBOX &bb) const { return false; }

};

//////////////////////////////////////////////////
void FillVertex(GtsPoint *_p, gpointer *_data)
{
  // create a Gazebo vertex from GTS_POINT and add it to the submesh
  gazebo::common::SubMesh *subMesh =
      reinterpret_cast<gazebo::common::SubMesh *>(_data[0]);
  GHashTable* vIndex = reinterpret_cast<GHashTable *>(_data[2]);
  subMesh->AddVertex(GTS_POINT(_p)->x, GTS_POINT(_p)->y, GTS_POINT(_p)->z);

  // add the normals, they are not correct now, but will be recalculated later.
  subMesh->AddNormal(0, 0, 1);

  // fill the hash table which will later be used for adding indices to the
  // submesh in the FillFace function.

  /*std::cout << GTS_POINT(_p)->x << " " << GTS_POINT(_p)->y << " " <<
       GTS_POINT(_p)->z << " " << (*(reinterpret_cast<guint *>(_data[1]))) << std::endl;*/
  g_hash_table_insert(vIndex, _p,
      GUINT_TO_POINTER((*(reinterpret_cast<guint *>(_data[1])))++));

 //     std::cout << " done " << std::endl;
}

//////////////////////////////////////////////////
void FillFace(GtsTriangle *_t, gpointer *_data)
{
  gazebo::common::SubMesh *subMesh =
      reinterpret_cast<gazebo::common::SubMesh *>(_data[0]);
  GHashTable* vIndex = reinterpret_cast<GHashTable *>(_data[2]);

  GtsVertex * v1, * v2, * v3;
  gts_triangle_vertices(_t, &v1, &v2, &v3);

  subMesh->AddIndex(GPOINTER_TO_UINT(g_hash_table_lookup(vIndex, v1)));
  subMesh->AddIndex(GPOINTER_TO_UINT(g_hash_table_lookup(vIndex, v2)));
  subMesh->AddIndex(GPOINTER_TO_UINT(g_hash_table_lookup(vIndex, v3)));
}

//////////////////////////////////////////////////
void MergeVertices(GPtrArray * _vertices, double _epsilon)
{
  GPtrArray *array;
  GNode *kdtree;
  GtsVertex **verticesData = reinterpret_cast<GtsVertex **>(_vertices->pdata);
  array = g_ptr_array_new();
  for (unsigned int i = 0; i < _vertices->len; ++i)
    g_ptr_array_add(array, verticesData[i]);
  kdtree = gts_kdtree_new(array, NULL);
  g_ptr_array_free(array, true);

  // for each vertex, do a bbox kdtree search to find nearby vertices within
  // _epsilon, merge vertices if they are within the bbox
  for (unsigned int i = 0; i < _vertices->len; i++)
  {
    GtsVertex *v = reinterpret_cast<GtsVertex *>(verticesData[i]);

    // make sure vertex v is active (because they could be marked inactive
    // due to previous merge operation)
    if (!GTS_OBJECT (v)->reserved)
    {
      GtsBBox *bbox;
      GSList *selected, *j;

      // build bounding box
      bbox = gts_bbox_new(gts_bbox_class(),
          v,
          GTS_POINT(v)->x - _epsilon,
          GTS_POINT(v)->y - _epsilon,
          GTS_POINT(v)->z - _epsilon,
          GTS_POINT(v)->x + _epsilon,
          GTS_POINT(v)->y + _epsilon,
          GTS_POINT(v)->z + _epsilon);

      // select vertices which are inside bbox using kdtree
      j = selected = gts_kdtree_range(kdtree, bbox, NULL);
      while (j)
      {
        GtsVertex *sv = reinterpret_cast<GtsVertex *>(j->data);
        // mark sv as inactive (merged)
        if (sv != v && !GTS_OBJECT(sv)->reserved)
          GTS_OBJECT(sv)->reserved = v;
        j = j->next;
      }
      g_slist_free(selected);
      gts_object_destroy(GTS_OBJECT(bbox));
    }
  }

  gts_kdtree_destroy(kdtree);

  // destroy inactive vertices
  // we want to control vertex destruction
  gts_allow_floating_vertices = true;
  for (unsigned int i = 0; i < _vertices->len; ++i)
  {
    GtsVertex * v = reinterpret_cast<GtsVertex *>(verticesData[i]);
    // v is inactive
    if (GTS_OBJECT(v)->reserved)
    {
      verticesData[i] =
          reinterpret_cast<GtsVertex *>(GTS_OBJECT(v)->reserved);
      gts_object_destroy(GTS_OBJECT(v));
    }
  }
  gts_allow_floating_vertices = false;
}

//////////////////////////////////////////////////
void ConvertGtsToGz(GtsSurface *_surface, gazebo::common::Mesh *_mesh)
{
  gazebo::common::SubMesh *subMesh = new gazebo::common::SubMesh();
  _mesh->AddSubMesh(subMesh);

  unsigned int n;
  gpointer data[3];
  GHashTable *vIndex = g_hash_table_new(NULL, NULL);

  n = 0;
  data[0] = subMesh;
  data[1] = &n;
  data[2] = vIndex;
  n = 0;
  gts_surface_foreach_vertex(_surface, (GtsFunc)FillVertex, data);
  n = 0;
  gts_surface_foreach_face(_surface, (GtsFunc)FillFace, data);
  g_hash_table_destroy(vIndex);

  // Calculate normals
  _mesh->RecalculateNormals();
}

//////////////////////////////////////////////////
void ConvertGzToGts(const gazebo::common::Mesh *_mesh, GtsSurface *_surface)
{
  if (!_surface)
  {
    gzerr << _mesh->GetName() << ": Surface is NULL\n";
    return;
  }

  std::vector<GtsSurface *> subSurfaces;
  for (unsigned int i = 0; i < _mesh->GetSubMeshCount(); ++i)
  {
    GtsSurface *subSurface = gts_surface_new(
      gts_surface_class(), gts_face_class(), gts_edge_class(),
      gts_vertex_class());

    const gazebo::common::SubMesh *subMesh = _mesh->GetSubMesh(i);
    unsigned int indexCount = subMesh->GetIndexCount();
    if (subMesh->GetVertexCount() <= 2)
      continue;

    GPtrArray *vertices = g_ptr_array_new();
    for (unsigned int j = 0; j < subMesh->GetVertexCount(); ++j)
    {
      gazebo::math::Vector3 vertex = subMesh->GetVertex(j);
      g_ptr_array_add(vertices, gts_vertex_new(gts_vertex_class(), vertex.x,
          vertex.y, vertex.z));
    }

    MergeVertices(vertices, 1e-7);

    GtsVertex **verticesData =
        reinterpret_cast<GtsVertex **>(vertices->pdata);
    for (unsigned int j = 0; j < indexCount/3; ++j)
    {
      // if vertices on the same GtsSegment, this segment. Else, NULL.
      GtsEdge *e1 = GTS_EDGE(gts_vertices_are_connected(
          verticesData[subMesh->GetIndex(3*j)],
          verticesData[subMesh->GetIndex(3*j+1)]));
      GtsEdge *e2 = GTS_EDGE(gts_vertices_are_connected(
          verticesData[subMesh->GetIndex(3*j+1)],
          verticesData[subMesh->GetIndex(3*j+2)]));
      GtsEdge *e3 = GTS_EDGE(gts_vertices_are_connected(
          verticesData[subMesh->GetIndex(3*j+2)],
          verticesData[subMesh->GetIndex(3*j)]));

      // If vertices are different and not connected
      if (e1 == NULL && verticesData[subMesh->GetIndex(3*j)]
          != verticesData[subMesh->GetIndex(3*j+1)])
      {

        e1 = gts_edge_new(subSurface->edge_class,
            verticesData[subMesh->GetIndex(3*j)],
            verticesData[subMesh->GetIndex(3*j+1)]);
      }
      if (e2 == NULL && verticesData[subMesh->GetIndex(3*j+1)]
          != verticesData[subMesh->GetIndex(3*j+2)])
      {
        e2 = gts_edge_new(subSurface->edge_class,
            verticesData[subMesh->GetIndex(3*j+1)],
            verticesData[subMesh->GetIndex(3*j+2)]);
      }
      if (e3 == NULL && verticesData[subMesh->GetIndex(3*j+2)]
          != verticesData[subMesh->GetIndex(3*j)])
      {
        e3 = gts_edge_new(subSurface->edge_class,
            verticesData[subMesh->GetIndex(3*j+2)],
            verticesData[subMesh->GetIndex(3*j)]);
      }

      // If all 3 edges are defined and different
      if (e1 != NULL && e2 != NULL && e3 != NULL &&
          e1 != e2 && e2 != e3 && e1 != e3)
      {


        if (GTS_SEGMENT (e1)->v1 == GTS_SEGMENT (e2)->v1)
        {
          if (!gts_segment_connect (GTS_SEGMENT (e3),
              GTS_SEGMENT (e1)->v2,
              GTS_SEGMENT (e2)->v2))
            continue;
        }
        else if (GTS_SEGMENT (e1)->v2 == GTS_SEGMENT (e2)->v1)
        {
          if (!gts_segment_connect (GTS_SEGMENT (e3),
              GTS_SEGMENT (e1)->v1,
              GTS_SEGMENT (e2)->v2))
            continue;
        }
        else if (GTS_SEGMENT (e1)->v2 == GTS_SEGMENT (e2)->v2)
        {
          if (!gts_segment_connect (GTS_SEGMENT (e3),
              GTS_SEGMENT (e1)->v1,
              GTS_SEGMENT (e2)->v1))
            continue;
        }
        else if (GTS_SEGMENT (e1)->v1 == GTS_SEGMENT (e2)->v2)
        {
          if (!gts_segment_connect (GTS_SEGMENT (e3),
              GTS_SEGMENT (e1)->v2,
              GTS_SEGMENT (e2)->v1))
            continue;
        }

      /*if (GTS_SEGMENT (e1)->v2 == GTS_SEGMENT (e2)->v2)
        {
          if (!gts_segment_connect (GTS_SEGMENT (e3),
             GTS_SEGMENT (e1)->v1,
             GTS_SEGMENT (e2)->v1))
          {
            std::cout << " fail " << std::endl;
            std::cout << e1->segment.v1->p.x << " " << e1->segment.v1->p.y << " "
                << e1->segment.v1->p.z << ", ";
            std::cout << e1->segment.v2->p.x << " " << e1->segment.v2->p.y << " "
                << e1->segment.v2->p.z << std::endl;
            std::cout << e2->segment.v1->p.x << " " << e2->segment.v1->p.y << " "
                << e2->segment.v1->p.z << ", ";
            std::cout << e2->segment.v2->p.x << " " << e2->segment.v2->p.y << " "
                << e2->segment.v2->p.z << std::endl;

            std::cout << " e3 " << std::endl;
            std::cout << e3->segment.v1->p.x << " " << e3->segment.v1->p.y << " "
                << e3->segment.v1->p.z << ", ";
            std::cout << e3->segment.v2->p.x << " " << e3->segment.v2->p.y << " "
                << e3->segment.v2->p.z << std::endl;
          }
        }*/

        GtsFace *face = gts_face_new(subSurface->face_class, e1, e2, e3);
        if (!gts_triangle_is_duplicate(&face->triangle))
          gts_surface_add_face(subSurface, face);

      }
      else
      {
        gzwarn << _mesh->GetName() << ": Ignoring degenerate facet!\n";
      }
    }
    subSurfaces.push_back(subSurface);
  }

  for (unsigned int i = 0; i < subSurfaces.size(); ++i)
    gts_surface_merge(_surface, subSurfaces[i]);

  gts_surface_print_stats (_surface, stderr);
  // Destroy duplicate triangles
  //triangle_cleanup(_surface);
}

/////////////////////////////////////////////////
static gboolean stop_number_verbose (gdouble cost, guint number, guint * min)
{
  static guint nmax = 0, nold = 0;
  static GTimer * timer = NULL, * total_timer = NULL;

  g_return_val_if_fail (min != NULL, TRUE);
  if (timer == NULL) {
    nmax = nold = number;
    timer = g_timer_new ();
    total_timer = g_timer_new ();
    g_timer_start (total_timer);
  }

  if (number != nold && number % 121 == 0 &&
      number < nmax && nmax > *min)
  {
    gdouble total_elapsed = g_timer_elapsed (total_timer, NULL);
    gdouble remaining;
    gdouble hours, mins, secs;
    gdouble hours1, mins1, secs1;

    g_timer_stop (timer);

    hours = floor (total_elapsed/3600.);
    mins = floor ((total_elapsed - 3600.*hours)/60.);
    secs = floor (total_elapsed - 3600.*hours - 60.*mins);

    remaining = total_elapsed*((nmax - *min)/(gdouble) (nmax - number) - 1.);
    hours1 = floor (remaining/3600.);
    mins1 = floor ((remaining - 3600.*hours1)/60.);
    secs1 = floor (remaining - 3600.*hours1 - 60.*mins1);

    fprintf (stderr,
	     "\rEdges: %10u %3.0f%% %6.0f edges/s "
	     "Elapsed: %02.0f:%02.0f:%02.0f "
	     "Remaining: %02.0f:%02.0f:%02.0f ",
	     number,
	     100.*(nmax - number)/(nmax - *min),
	     (nold - number)/g_timer_elapsed (timer, NULL),
	     hours, mins, secs,
	     hours1, mins1, secs1);
    fflush (stderr);

    nold = number;
    g_timer_start (timer);
  }
  if (number < *min) {
    g_timer_destroy (timer);
    g_timer_destroy (total_timer);
    return TRUE;
  }
  return FALSE;
}

//////////////////////////////////////////////////
void FillTextureSource(const gazebo::common::Mesh *_outGz,
    const gazebo::common::Mesh *_inGz,
    TiXmlElement *Mesh,
    const char *meshID)
{
  const gazebo::common::SubMesh *outSubMesh = _outGz->GetSubMesh(0);
  const gazebo::common::SubMesh *inSubMesh = _inGz->GetSubMesh(0);

  // For collada
  std::ostringstream sourceID;
  std::ostringstream sourceArrayID;
  std::ostringstream sourceArrayIdSelector;
  unsigned int outCount = outSubMesh->GetVertexCount();
  unsigned int inCount = inSubMesh->GetVertexCount();
  int stride = 2;
  std::ostringstream fillData;
  fillData.precision(5);
  fillData<<std::fixed;

  std::cout << "Calculating texture map..." << std::endl;

  // Fill the point cloud with vertices from the original mesh
  //assert(inCount%3 == 0);
  PointCloud<double> cloud;
  cloud.pts.resize(inCount);
  gazebo::math::Vector3 inVertex;
  for(long unsigned int i = 0; i < inCount; ++i)
  {
      inVertex = inSubMesh->GetVertex(i);
      cloud.pts[i].x = inVertex.x;
      cloud.pts[i].y = inVertex.y;
      cloud.pts[i].z = inVertex.z;
  }

  // construct a kd-tree index:
  typedef nanoflann::KDTreeSingleIndexAdaptor<
      nanoflann::L2_Simple_Adaptor<double, PointCloud<double> > ,
      PointCloud<double>,
      3
      > my_kd_tree_t;

  my_kd_tree_t cloudIndex(3, cloud, nanoflann::KDTreeSingleIndexAdaptorParams(10));
  cloudIndex.buildIndex();

  // For each vertex of each triangle
  unsigned int outTriIndexCount = outSubMesh->GetIndexCount();
  const long unsigned int num_results = 30;
  std::vector<long unsigned int> result_index(num_results);
  std::vector<double> out_dist_sqr(num_results);
  static const int offset[] = {1,2,-1,1,-2,-1};
  for (int i = 0; i < outTriIndexCount; i++)
  {
    unsigned int outIndex = outSubMesh->GetIndex(i);
    gazebo::math::Vector3 outVertex = outSubMesh->GetVertex(outIndex);

    const double query_pt[3] = { outVertex.x, outVertex.y, outVertex.z};
    // Get nearest num_results
    cloudIndex.knnSearch(&query_pt[0], num_results, &result_index[0],
        &out_dist_sqr[0]);

    std::vector<long unsigned int> closestIndices;
    double closestDistance = 1000;
    for (int j = 0; j < num_results; j++)
    {
      inVertex = inSubMesh->GetVertex(result_index[j]);

      double distance = inVertex.Distance(outVertex);
      // closer vertex
      if ( distance <  closestDistance)
      {
        closestDistance = distance;
        closestIndices.clear();
        closestIndices.push_back(result_index[j]);
      }
      // overlapping vertex
      else if ( distance == closestDistance )
      {
        closestIndices.push_back(result_index[j]);
      }
    }

    // Choose best UV among overlapping closestIndices

    // index%3 == 0: beginning of a triangle
    // triangle 1: i == 0,1,2; triangle 2: i == 3,4,5 and so on
    gazebo::math::Vector2d outOffset(i+offset[(i % 3)*2],
                                     i+offset[(i % 3)*2+1]);
    // Get other vertices in the same triangle
    unsigned int outIndex_1 = outSubMesh->GetIndex(outOffset.x);
    unsigned int outIndex_2 = outSubMesh->GetIndex(outOffset.y);
    gazebo::math::Vector3 outVertex_1 = outSubMesh->GetVertex(outIndex_1);
    gazebo::math::Vector3 outVertex_2 = outSubMesh->GetVertex(outIndex_2);

    // Get directions
    gazebo::math::Vector3 outDir_1 = (outVertex_1-outVertex).Normalize();
    gazebo::math::Vector3 outDir_2 = (outVertex_2-outVertex).Normalize();

    // Initialize closestVertex
    long unsigned int closestIndex = closestIndices[0];
    gazebo::math::Vector2d closestOffset(closestIndex+offset[(closestIndex % 3)*2],
                                         closestIndex+offset[(closestIndex % 3)*2+1]);

    gazebo::math::Vector3 closestVertex = inSubMesh->GetVertex(closestIndex);
    gazebo::math::Vector3 closestVertex_1 = inSubMesh->GetVertex(closestOffset.x);
    gazebo::math::Vector3 closestVertex_2 = inSubMesh->GetVertex(closestOffset.y);

    gazebo::math::Vector3 closestDir_1 = (closestVertex_1-closestVertex).Normalize();
    gazebo::math::Vector3 closestDir_2 = (closestVertex_2-closestVertex).Normalize();

    // Initialize sum of closest directions
    double closestSum;
    if ( outDir_1.Distance(closestDir_1) < outDir_1.Distance(closestDir_2) )
    {
      closestSum = outDir_1.Distance(closestDir_1) + outDir_2.Distance(closestDir_2);
    }
    else
    {
      closestSum = outDir_2.Distance(closestDir_1) + outDir_1.Distance(closestDir_2);
    }

    // Find the closest direction among all triangles containing overlapping vertices
    for (int k = 1; k < closestIndices.size(); k++)
    {
      // Current vertex
      long unsigned int currentIndex = closestIndices[k];
      gazebo::math::Vector2d currentOffset(currentIndex+offset[(currentIndex % 3)*2],
                                           currentIndex+offset[(currentIndex % 3)*2+1]);

      gazebo::math::Vector3 currentVertex = inSubMesh->GetVertex(currentIndex);
      gazebo::math::Vector3 currentVertex_1 = inSubMesh->GetVertex(currentOffset.x);
      gazebo::math::Vector3 currentVertex_2 = inSubMesh->GetVertex(currentOffset.y);

      gazebo::math::Vector3 currentDir_1 = (currentVertex_1-currentVertex).Normalize();
      gazebo::math::Vector3 currentDir_2 = (currentVertex_2-currentVertex).Normalize();

      double currentSum;
      if ( outDir_1.Distance(currentDir_1) < outDir_1.Distance(currentDir_2) )
      {
        currentSum = outDir_1.Distance(currentDir_1) + outDir_2.Distance(currentDir_2);
      }
      else
      {
        currentSum = outDir_2.Distance(currentDir_1) + outDir_1.Distance(currentDir_2);
      }

      if (currentSum < closestSum)
      {
        closestSum = currentSum;
        closestIndex = currentIndex;
        closestDir_1 = currentDir_1;
        closestDir_2 = currentDir_2;
        closestVertex = currentVertex;
      }
    }

    // Get UV coordinates
    double U = inSubMesh->GetTexCoord(closestIndex).x;
    double V = inSubMesh->GetTexCoord(closestIndex).y;

    fillData << U << " " << 1.0-V << " ";
  }

/*
  gazebo::math::Vector2d inTexCoord;
  for(long unsigned int i = 0; i < inCount; ++i)
  {
    inTexCoord = inSubMesh->GetTexCoord(i);
    fillData << inTexCoord.x << " " << 1-inTexCoord.y << " ";
  }
*/

  std::cout << "Texture map calculation complete." << std::endl;

  sourceID << meshID << "-UVMap";
  sourceArrayID << sourceID.str() << "-array";
  sourceArrayIdSelector << "#" << sourceArrayID.str();

  TiXmlElement *source = new TiXmlElement( "source" );
  Mesh->LinkEndChild( source );
  source->SetAttribute("id", sourceID.str().c_str());
  source->SetAttribute("name", sourceID.str().c_str());

  TiXmlElement *float_array = new TiXmlElement( "float_array" );
  float_array->SetAttribute("count", outCount*stride);
  float_array->SetAttribute("id", sourceArrayID.str().c_str());
  float_array->LinkEndChild( new TiXmlText( fillData.str().c_str() ));
  source->LinkEndChild( float_array );

  TiXmlElement *technique_common = new TiXmlElement( "technique_common" );
  source->LinkEndChild( technique_common );

  TiXmlElement *accessor = new TiXmlElement( "accessor" );
  accessor->SetAttribute("count", outCount);
  accessor->SetAttribute("source", sourceArrayIdSelector.str().c_str());
  accessor->SetAttribute("stride", stride);
  technique_common->LinkEndChild( accessor );

  TiXmlElement *param = new TiXmlElement( "param" );

  param->SetAttribute("type", "float");
  param->SetAttribute("name", "U");
  accessor->LinkEndChild( param );

  param = new TiXmlElement( "param" );
  param->SetAttribute("type", "float");
  param->SetAttribute("name", "V");
  accessor->LinkEndChild( param );
}

//////////////////////////////////////////////////
void FillGeometrySources(const gazebo::common::SubMesh *_subMesh,
    TiXmlElement *Mesh, int type, const char *meshID)
{

  std::ostringstream sourceID;
  std::ostringstream sourceArrayID;
  std::ostringstream sourceArrayIdSelector;
  std::ostringstream fillData;
  fillData.precision(5);
  fillData<<std::fixed;
  int stride;
  unsigned int count;

  if (type == 1)
  {
    sourceID << meshID << "-Positions";
    count = _subMesh->GetVertexCount();
    stride = 3;
    gazebo::math::Vector3 vertex;
    for(unsigned int i = 0; i < count; ++i)
    {
      vertex = _subMesh->GetVertex(i);
      fillData << vertex.x << " " << vertex.y << " " << vertex.z << " ";
    }
  }
  if (type == 2)
  {
    sourceID << meshID << "-Normals";
    count = _subMesh->GetNormalCount();
    stride = 3;
    gazebo::math::Vector3 normal;
    for(unsigned int i = 0; i < count; ++i)
    {
      normal = _subMesh->GetNormal(i);
      fillData << normal.x << " " << normal.y << " " << normal.z << " ";
    }
  }
  sourceArrayID << sourceID.str() << "-array";
  sourceArrayIdSelector << "#" << sourceArrayID.str();

  TiXmlElement *source = new TiXmlElement( "source" );
  Mesh->LinkEndChild( source );
  source->SetAttribute("id", sourceID.str().c_str());
  source->SetAttribute("name", sourceID.str().c_str());

  TiXmlElement *float_array = new TiXmlElement( "float_array" );
  float_array->SetAttribute("count", count*stride);
  float_array->SetAttribute("id", sourceArrayID.str().c_str());
  float_array->LinkEndChild( new TiXmlText( fillData.str().c_str() ));
  source->LinkEndChild( float_array );

  TiXmlElement *technique_common = new TiXmlElement( "technique_common" );
  source->LinkEndChild( technique_common );

  TiXmlElement *accessor = new TiXmlElement( "accessor" );
  accessor->SetAttribute("count", count);
  accessor->SetAttribute("source", sourceArrayIdSelector.str().c_str());
  accessor->SetAttribute("stride", stride);
  technique_common->LinkEndChild( accessor );

  TiXmlElement *param = new TiXmlElement( "param" );

  if (type == 1 || type == 2)
  {
    param->SetAttribute("type", "float");
    param->SetAttribute("name", "X");
    accessor->LinkEndChild( param );

    param = new TiXmlElement( "param" );
    param->SetAttribute("type", "float");
    param->SetAttribute("name", "Y");
    accessor->LinkEndChild( param );

    param = new TiXmlElement( "param" );
    param->SetAttribute("type", "float");
    param->SetAttribute("name", "Z");
    accessor->LinkEndChild( param );
  }
}

//////////////////////////////////////////////////
void CopyElement(TiXmlElement *inElem, TiXmlElement *outElem)
{
  TiXmlElement* inSubElem;
  inSubElem = inElem->FirstChildElement();

  TiXmlElement* outSubElem;
  for( inSubElem; inSubElem; inSubElem=inSubElem->NextSiblingElement())
  {
    const char *elementValue=inSubElem->Value();
    const char *elementText=inSubElem->GetText();
    if (elementValue)
    {
      if ( strcmp(elementValue,"unit") == 0)
      {
        outSubElem = new TiXmlElement( "unit" );
        outSubElem->SetAttribute("meter", "1");
        outSubElem->SetAttribute("name", "meter");
      }
      else
      {
        outSubElem = new TiXmlElement( elementValue );
        if (elementText)
        {
           outSubElem->LinkEndChild( new TiXmlText( elementText ));
        }
        TiXmlAttribute* inAttribute=inSubElem->FirstAttribute();
        while (inAttribute)
        {
          outSubElem->SetAttribute(inAttribute->Name(), inAttribute->Value());
          inAttribute=inAttribute->Next();
        }
        CopyElement(inSubElem,outSubElem);
      }
      outElem->LinkEndChild( outSubElem );
    }
  }
}

//////////////////////////////////////////////////
TiXmlDocument ConvertGzToDae(TiXmlDocument _inDae,
    const gazebo::common::Mesh *_outGz,
    const gazebo::common::Mesh *_inGz)
{
  TiXmlElement *inElem;
  char attributeValue[100];
  bool hasTexture = true;

  if (_inGz->GetSubMesh(0)->GetTexCoordCount() == 0)
  {
    hasTexture = false;
    std::cout << "The model doesn't have textures." << std::endl;
  }

  const gazebo::common::SubMesh *_subMesh = _outGz->GetSubMesh(0);

  // Input and output collada files
  TiXmlHandle h_inDae(&_inDae);
  TiXmlDocument _outDae;

  // XML declaration
  TiXmlDeclaration* decl = new TiXmlDeclaration( "1.0", "utf-8", "" );
  _outDae.LinkEndChild( decl );

  // output COLLADA element
  TiXmlElement *collada = new TiXmlElement( "COLLADA" );
  _outDae.LinkEndChild( collada );
  collada->SetAttribute("version", "1.4.1");
  collada->SetAttribute("xmlns", "http://www.collada.org/2005/11/COLLADASchema");

  // asset
  // input asset element
  inElem=h_inDae.FirstChildElement().FirstChild( "asset" ).Element();
  // output asset element
  TiXmlElement *asset = new TiXmlElement( "asset" );
  collada->LinkEndChild( asset );

  CopyElement(inElem,asset);

  // library_geometries
  TiXmlElement *library_geometries = new TiXmlElement( "library_geometries" );
  collada->LinkEndChild( library_geometries );

  TiXmlElement *geometry = new TiXmlElement( "geometry" );
  library_geometries->LinkEndChild( geometry );

  // Copy geometry name and ID
  inElem=h_inDae.FirstChildElement().FirstChild( "library_geometries" )
      .FirstChild( "geometry" ).Element();
  const char *meshID = inElem->Attribute("id");
  if (!meshID)
  {
    meshID = "mesh0";
  }

  geometry->SetAttribute("id", meshID);

  TiXmlElement *Mesh = new TiXmlElement( "mesh" );
  geometry->LinkEndChild( Mesh );

  // Position
  FillGeometrySources(_subMesh, Mesh, 1, meshID);
  // Normals
  FillGeometrySources(_subMesh, Mesh, 2, meshID);
  // UV Map
  if (hasTexture)
  {
    FillTextureSource(_outGz, _inGz, Mesh, meshID);
  }

  // Vertices
  TiXmlElement *vertices = new TiXmlElement( "vertices" );
  Mesh->LinkEndChild( vertices );
  strcpy(attributeValue,meshID);
  strcat(attributeValue,"-Vertex");
  vertices->SetAttribute("id", attributeValue);
  vertices->SetAttribute("name", attributeValue);

  TiXmlElement *input = new TiXmlElement( "input" );
  vertices->LinkEndChild( input );
  input->SetAttribute("semantic", "POSITION");
  strcpy(attributeValue,"#");
  strcat(attributeValue,meshID);
  strcat(attributeValue,"-Positions");
  input->SetAttribute("source", attributeValue);

  // Triangles
  unsigned int indexCount = _subMesh->GetIndexCount();

  TiXmlElement *triangles = new TiXmlElement( "triangles" );
  Mesh->LinkEndChild( triangles );
  triangles->SetAttribute("count", indexCount/3);
  inElem=h_inDae.FirstChildElement().FirstChild( "library_geometries" )
      .FirstChild( "geometry" ).FirstChild( "mesh" )
      .FirstChild( "triangles" ).Element();
  if (!inElem)
  {
    inElem=h_inDae.FirstChildElement().FirstChild( "library_geometries" )
      .FirstChild( "geometry" ).FirstChild( "mesh" )
      .FirstChild( "polylist" ).Element();
  }
  const char *triangleMaterialID = inElem->Attribute("material");
  if (triangleMaterialID)
  {
    triangles->SetAttribute("material", inElem->Attribute("material"));
  }

  input = new TiXmlElement( "input" );
  triangles->LinkEndChild( input );
  input->SetAttribute("offset", 0);
  input->SetAttribute("semantic", "VERTEX");
  strcpy(attributeValue,"#");
  strcat(attributeValue,meshID);
  strcat(attributeValue,"-Vertex");
  input->SetAttribute("source", attributeValue);

  input = new TiXmlElement( "input" );
  triangles->LinkEndChild( input );
  input->SetAttribute("offset", 1);
  input->SetAttribute("semantic", "NORMAL");
  strcpy(attributeValue,"#");
  strcat(attributeValue,meshID);
  strcat(attributeValue,"-Normals");
  input->SetAttribute("source", attributeValue);

  if (hasTexture)
  {
    input = new TiXmlElement( "input" );
    triangles->LinkEndChild( input );
    input->SetAttribute("offset", 2);
    input->SetAttribute("semantic", "TEXCOORD");
    strcpy(attributeValue,"#");
    strcat(attributeValue,meshID);
    strcat(attributeValue,"-UVMap");
    input->SetAttribute("source", attributeValue);
  }

  std::ostringstream fillData;
  // Putting all offset = 0 and writing the index only once
  // doesn't work for meshlab but does for gzweb
  for (unsigned int i = 0; i < indexCount; ++i)
  {
    fillData << _subMesh->GetIndex(i) << " "
             << _subMesh->GetIndex(i) << " ";
    if (hasTexture)
    {
      fillData << i << " ";
    }
  }

  TiXmlElement *p = new TiXmlElement( "p" );
  triangles->LinkEndChild( p );
  p->LinkEndChild( new TiXmlText( fillData.str().c_str() ));

  // If there are extras
  // input extra element
  inElem=h_inDae.FirstChildElement().FirstChild( "library_geometries" )
      .FirstChild( "geometry" ).FirstChild( "extra" ).Element();
  if(inElem)
  {
    // output extra element
    TiXmlElement *extra = new TiXmlElement( "extra" );
    geometry->LinkEndChild( extra );

    CopyElement(inElem,extra);
  }

  // library_images
  // input library_images element
  inElem=h_inDae.FirstChildElement().FirstChild( "library_images" ).Element();
  if(inElem)
  {
    // output library_images element
    TiXmlElement *libraryImages = new TiXmlElement( "library_images" );
    collada->LinkEndChild( libraryImages );

    CopyElement(inElem,libraryImages);
  }

  // library_materials
  // input library_materials element
  inElem=h_inDae.FirstChildElement().FirstChild( "library_materials" ).Element();
  // output library_materials element
  TiXmlElement *libraryMaterials = new TiXmlElement( "library_materials" );
  collada->LinkEndChild( libraryMaterials );
  const char *materialID = NULL;
  if(inElem)
  {
    CopyElement(inElem,libraryMaterials);
    // Copy material ID
    inElem=h_inDae.FirstChildElement().FirstChild( "library_materials" )
        .FirstChild( "material" ).Element();
    if(inElem)
    {
      materialID = inElem->Attribute("id");
    }
  }

  // library_effects
  // input library_effects element
  inElem=h_inDae.FirstChildElement().FirstChild( "library_effects" ).Element();
  // output library_effects element
  TiXmlElement *libraryEffects = new TiXmlElement( "library_effects" );
  collada->LinkEndChild( libraryEffects );
  if(inElem)
  {
    CopyElement(inElem,libraryEffects);
  }

  // library_visual_scenes
  TiXmlElement *library_visual_scenes =
      new TiXmlElement( "library_visual_scenes" );
  collada->LinkEndChild( library_visual_scenes );

  TiXmlElement *visual_scene = new TiXmlElement( "visual_scene" );
  library_visual_scenes->LinkEndChild( visual_scene );
  visual_scene->SetAttribute("name", "Scene");
  visual_scene->SetAttribute("id", "Scene");

  TiXmlElement *node = new TiXmlElement( "node" );
  visual_scene->LinkEndChild( node );
  node->SetAttribute("name", "node");
  node->SetAttribute("id", "node");

  TiXmlElement *instance_geometry = new TiXmlElement( "instance_geometry" );
  node->LinkEndChild( instance_geometry );
  strcpy(attributeValue,"#");
  strcat(attributeValue,meshID);
  instance_geometry->SetAttribute("url", attributeValue);

  TiXmlElement *bind_material = new TiXmlElement( "bind_material" );
  instance_geometry->LinkEndChild( bind_material );

  TiXmlElement *techniqueCommon = new TiXmlElement( "technique_common" );
  bind_material->LinkEndChild( techniqueCommon );

  if (materialID)
  {
    TiXmlElement *instanceMaterial = new TiXmlElement( "instance_material" );
    techniqueCommon->LinkEndChild( instanceMaterial );
    instanceMaterial->SetAttribute("symbol", materialID);
    strcpy(attributeValue,"#");
    strcat(attributeValue,materialID);
    instanceMaterial->SetAttribute("target", attributeValue);

    TiXmlElement *bindVertexInput = new TiXmlElement( "bind_vertex_input" );
    instanceMaterial->LinkEndChild( bindVertexInput );
    bindVertexInput->SetAttribute("semantic", "UVSET0");
    bindVertexInput->SetAttribute("input_semantic", "TEXCOORD");
  }

  // scene
  TiXmlElement *scene = new TiXmlElement( "scene" );
  collada->LinkEndChild( scene );

  TiXmlElement *instance_visual_scene =
      new TiXmlElement( "instance_visual_scene" );
  scene->LinkEndChild( instance_visual_scene );
  instance_visual_scene->SetAttribute("url", "#Scene");

  return(_outDae);
}

/////////////////////////////////////////////////
int main(int argc, char **argv)
{
  if (argc < 3)
  {
    gzerr << "Missing argument. Please specify a collada file and "<<
             "the desired percentage of edges. For 20%, write 20."
        << std::endl;
    return -1;
  }
  if (atoi(argv[2]) < 0 || atoi(argv[2]) > 100)
  {
    gzerr << "The percentage must be between 0 and 100"
        << std::endl;
    return -1;
  }

  TiXmlDocument inDae( argv[1] );
  if (!inDae.LoadFile())
  {
    gzerr << "Could not open dae file." << std::endl;
    return -1;
  }

  std::string filename = argv[1];
  filename = filename.substr(0, filename.find(".dae"));

  // load collada mesh into Gazebo Mesh format
  const gazebo::common::Mesh *inGz =
      gazebo::common::MeshManager::Instance()->Load(argv[1]);
/*
  // export original Gz mesh to Dae
  TiXmlDocument exportInDae;
  exportInDae = ConvertGzToDae(inDae,inGz,inGz);
  exportInDae.SaveFile( filename+"_original.dae" );

  //return 0;
*/
  GtsSurface *in_out_Gts;
  GNode *tree1;
  in_out_Gts = gts_surface_new(gts_surface_class(), gts_face_class(), gts_edge_class(),
      gts_vertex_class());

  // convert Gazebo Mesh to GTS format
  ConvertGzToGts(inGz, in_out_Gts);

  /*** Do mesh simplification here ***/

  // Number of edges
  guint edgesBefore = gts_surface_edge_number(in_out_Gts);
  std::cout << "Edges before: " << edgesBefore << std::endl;

  if (edgesBefore < 300)
  {
    gzwarn << "There are less than 300 edges. Not simplifying.\n";
    return -1;
  }

  // print stats
  /*gts_surface_print_stats (in_out_Gts, stderr);
  fprintf (stderr, "# volume: %g area: %g\n",
  	     gts_surface_volume (in_out_Gts), gts_surface_area (in_out_Gts));*/

  // default cost function COST_OPTIMIZED
  GtsKeyFunc cost_func = (GtsKeyFunc) gts_volume_optimized_cost;
  GtsVolumeOptimizedParams params = { 0.5, 0.5, 0. };
  gpointer cost_data = &params;

  // default coarsen function OPTIMIZED
  GtsCoarsenFunc coarsen_func = (GtsCoarsenFunc) gts_volume_optimized_vertex;
  gpointer coarsen_data = &params;

  // set stop to number
  GtsStopFunc stop_func = (GtsStopFunc) stop_number_verbose;
  double desiredPercentage = atoi (argv[2]);
  guint number = edgesBefore * desiredPercentage/100;

  gpointer stop_data = &number;

  // maximum fold angle
  gdouble fold = PI/180.;

  // coarsen
  gts_surface_coarsen (in_out_Gts,
      cost_func, cost_data,
      coarsen_func, coarsen_data,
      stop_func, stop_data, fold);

  // Number of edges
  guint edgesAfter = gts_surface_edge_number(in_out_Gts);
  double obtainedPercentage = (double)100*edgesAfter/edgesBefore;
  std::cout << std::endl << "Edges after: " << edgesAfter << " (" << obtainedPercentage << "%)" << std::endl;

  if (obtainedPercentage > desiredPercentage*1.5)
  {
    std::cout << "It wasn't possible to significantly reduce the mesh. Not simplifying." << std::endl;
    return 0;
  }

  // stats after coarsening
  /*gts_surface_print_stats (in_out_Gts, stderr);
  fprintf (stderr, "# volume: %g area: %g\n",
	     gts_surface_volume (in_out_Gts), gts_surface_area (in_out_Gts));*/

  /*** End mesh simplification ***/

  // Output Gazebo mesh
  gazebo::common::Mesh *outGz = new gazebo::common::Mesh();
  ConvertGtsToGz(in_out_Gts,outGz);

  /*** Export as COLLADA ***/

  TiXmlDocument outDae;

  outDae = ConvertGzToDae(inDae,outGz,inGz);

  outDae.SaveFile( filename+"_coarse.dae" );

  /*** End export as COLLADA ***/

  // destroy surfaces
  gts_object_destroy(GTS_OBJECT(in_out_Gts));

  return 0;
}
