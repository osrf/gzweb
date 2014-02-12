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

#ifndef PI
#define PI 3.14159265359
#endif

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
  g_hash_table_insert(vIndex, _p,
      GUINT_TO_POINTER((*(reinterpret_cast<guint *>(_data[1])))++));
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
void ConvertMeshToGTS(const gazebo::common::Mesh *_mesh, GtsSurface *_surface)
{
  if (!_surface)
  {
    gzerr << _mesh->GetName() << ": Surface is NULL\n";
    return;
  }

  GPtrArray *vertices = g_ptr_array_new();

  for (unsigned int i = 0; i < _mesh->GetSubMeshCount(); ++i)
  {
    const gazebo::common::SubMesh *subMesh = _mesh->GetSubMesh(i);
    unsigned int indexCount = subMesh->GetIndexCount();
    if (subMesh->GetVertexCount() <= 2)
      continue;

    for (unsigned int j = 0; j < subMesh->GetVertexCount(); ++j)
    {
      gazebo::math::Vector3 vertex = subMesh->GetVertex(j);
      g_ptr_array_add(vertices, gts_vertex_new(gts_vertex_class(), vertex.x,
          vertex.y, vertex.z));
    }

    // merge duplicate vertices, otherwise gts produces undesirable results
    MergeVertices(vertices, 0.0001);

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
        e1 = gts_edge_new(_surface->edge_class,
            verticesData[subMesh->GetIndex(3*j)],
            verticesData[subMesh->GetIndex(3*j+1)]);
      }
      if (e2 == NULL && verticesData[subMesh->GetIndex(3*j+1)]
          != verticesData[subMesh->GetIndex(3*j+2)])
      {
        e2 = gts_edge_new(_surface->edge_class,
            verticesData[subMesh->GetIndex(3*j+1)],
            verticesData[subMesh->GetIndex(3*j+2)]);
      }
      if (e3 == NULL && verticesData[subMesh->GetIndex(3*j+2)]
          != verticesData[subMesh->GetIndex(3*j)])
      {
        e3 = gts_edge_new(_surface->edge_class,
            verticesData[subMesh->GetIndex(3*j+2)],
            verticesData[subMesh->GetIndex(3*j)]);
      }
      // If all 3 edges are defined and different
      if (e1 != NULL && e2 != NULL && e3 != NULL &&
          e1 != e2 && e2 != e3 && e1 != e3)
      {
        gts_surface_add_face(_surface, gts_face_new(_surface->face_class, e1,
            e2, e3));
      }
      else
      {
        gzwarn << _mesh->GetName() << ": Ignoring degenerate facet!\n";
      }
    }
  }
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
void FillGeometrySources(const gazebo::common::SubMesh *_subMesh, TiXmlElement *Mesh, int type)
{

  std::ostringstream sourceID;
  std::ostringstream sourceArrayID;
  std::ostringstream sourceArrayIdSelector;
  std::ostringstream fillData;
  fillData.precision(5);
  fillData<<std::fixed;
  int stride;
  unsigned int count;;

  if (type == 1)
  {
    sourceID << "mesh001-Positions";
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
    sourceID << "mesh001-Normals";
    count = _subMesh->GetNormalCount();
    stride = 3;
    gazebo::math::Vector3 normal;
    for(unsigned int i = 0; i < count; ++i)
    {
      normal = _subMesh->GetNormal(i);
      fillData << normal.x << " " << normal.y << " " << normal.z << " ";
    }
  }
  if (type == 3)
  {
    sourceID << "mesh001-UVMap";
    count = _subMesh->GetTexCoordCount();
    stride = 2;
    gazebo::math::Vector2d texCoord;
    for(unsigned int i = 0; i < count; ++i)
    {
      texCoord = _subMesh->GetTexCoord(i);
      fillData << texCoord.x << " " << texCoord.y << " ";
    }
  }
  sourceArrayID << sourceID.str() << "-array";
  sourceArrayIdSelector << "#" << sourceArrayID.str();

  TiXmlElement *source = new TiXmlElement( "source" );
  Mesh->LinkEndChild( source );
  source->SetAttribute("id", sourceID.str().c_str());

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
  if (type == 3)
  {
    param->SetAttribute("type", "float");
    param->SetAttribute("name", "U");
    accessor->LinkEndChild( param );

    param = new TiXmlElement( "param" );
    param->SetAttribute("type", "float");
    param->SetAttribute("name", "V");
    accessor->LinkEndChild( param );
  }
}

//////////////////////////////////////////////////
TiXmlDocument ConvertMeshToDae(TiXmlDocument daeIn, const gazebo::common::SubMesh *_subMesh)
{

  // Input and output collada files
  TiXmlHandle hDaeIn(&daeIn);
  TiXmlDocument daeOut;

  // XML declaration
  TiXmlDeclaration* decl = new TiXmlDeclaration( "1.0", "utf-8", "" );
  daeOut.LinkEndChild( decl );

  // output COLLADA element
  TiXmlElement *collada = new TiXmlElement( "COLLADA" );
  daeOut.LinkEndChild( collada );
  collada->SetAttribute("version", "1.4.1");
  collada->SetAttribute("xmlns", "http://www.collada.org/2005/11/COLLADASchema");

  // output asset element
  TiXmlElement *asset = new TiXmlElement( "asset" );
  collada->LinkEndChild( asset );

  // output contributor element
  TiXmlElement *contributor = new TiXmlElement( "contributor" );
  asset->LinkEndChild( contributor );

  // Copy asset from input file -- TODO: make a recursive function
  TiXmlElement* pElem;

  pElem=hDaeIn.FirstChildElement().FirstChild( "asset" ).FirstChild( "contributor" ).FirstChild().Element();

  TiXmlElement* pElem2;
  for( pElem; pElem; pElem=pElem->NextSiblingElement())
  {
    const char *pKey=pElem->Value();
    const char *pText=pElem->GetText();
    if (pKey)
    {
      pElem2 = new TiXmlElement( pKey );
      if (pText)
      {
         pElem2->LinkEndChild( new TiXmlText( pText ));
      }
      contributor->LinkEndChild( pElem2 );
    }
  }

  pElem=hDaeIn.FirstChildElement().FirstChild( "asset" ).FirstChild( "contributor" ).Element();
  pElem=pElem->NextSiblingElement(); // Skip contributor

  for( pElem; pElem; pElem=pElem->NextSiblingElement())
  {
    const char *pKey=pElem->Value();
    const char *pText=pElem->GetText();
    if (pKey)
    {
      pElem2 = new TiXmlElement( pKey );
      if (pText)
      {
         pElem2->LinkEndChild( new TiXmlText( pText ));
      }
      TiXmlAttribute* pAttrib=pElem->FirstAttribute();
      while (pAttrib)
      {
        pElem2->SetAttribute(pAttrib->Name(), pAttrib->Value());
        pAttrib=pAttrib->Next();
      }
      asset->LinkEndChild( pElem2 );
    }
  }

  // library_geometries
  TiXmlElement *library_geometries = new TiXmlElement( "library_geometries" );
  collada->LinkEndChild( library_geometries );

  TiXmlElement *geometry = new TiXmlElement( "geometry" );
  library_geometries->LinkEndChild( geometry );
  geometry->SetAttribute("name", "mesh001");
  geometry->SetAttribute("id", "mesh001");

  TiXmlElement *Mesh = new TiXmlElement( "mesh" );
  geometry->LinkEndChild( Mesh );

  // Position
  FillGeometrySources(_subMesh, Mesh, 1);
  // Normals
  FillGeometrySources(_subMesh, Mesh, 2);
  // UV Map
  FillGeometrySources(_subMesh, Mesh, 3);

  // Vertices
  TiXmlElement *vertices = new TiXmlElement( "vertices" );
  Mesh->LinkEndChild( vertices );
  vertices->SetAttribute("id", "mesh001-Vertex");

  TiXmlElement *input = new TiXmlElement( "input" );
  vertices->LinkEndChild( input );
  input->SetAttribute("semantic", "POSITION");
  input->SetAttribute("source", "#mesh001-Positions");

  // Triangles
  unsigned int indexCount = _subMesh->GetIndexCount();

  TiXmlElement *triangles = new TiXmlElement( "triangles" );
  Mesh->LinkEndChild( triangles );
  triangles->SetAttribute("count", indexCount/3);
  triangles->SetAttribute("material", "material0");

  input = new TiXmlElement( "input" );
  triangles->LinkEndChild( input );
  input->SetAttribute("offset", 0);
  input->SetAttribute("semantic", "VERTEX");
  input->SetAttribute("source", "#mesh001-Vertex");

  input = new TiXmlElement( "input" );
  triangles->LinkEndChild( input );
  input->SetAttribute("offset", 1);
  input->SetAttribute("semantic", "NORMAL");
  input->SetAttribute("source", "#mesh001-Normals");

  input = new TiXmlElement( "input" );
  triangles->LinkEndChild( input );
  input->SetAttribute("offset", 2);
  input->SetAttribute("semantic", "TEXCOORD");
  input->SetAttribute("source", "#mesh001-UVMap");

  std::ostringstream fillData;
  for (unsigned int i = 0; i < indexCount; ++i)
  {
    fillData << _subMesh->GetIndex(i) << " " << _subMesh->GetIndex(i) << " "
        << _subMesh->GetIndex(i) << " ";
  }

  TiXmlElement *p = new TiXmlElement( "p" );
  triangles->LinkEndChild( p );
  p->LinkEndChild( new TiXmlText( fillData.str().c_str() ));

  // library_visual_scenes
  TiXmlElement *library_visual_scenes = new TiXmlElement( "library_visual_scenes" );
  collada->LinkEndChild( library_visual_scenes );

  TiXmlElement *visual_scene = new TiXmlElement( "visual_scene" );
  library_visual_scenes->LinkEndChild( visual_scene );
  visual_scene->SetAttribute("name", "Scene");
  visual_scene->SetAttribute("id", "Scene");

  TiXmlElement *node = new TiXmlElement( "node" );
  visual_scene->LinkEndChild( node );
  node->SetAttribute("name", "mesh1");
  node->SetAttribute("id", "mesh1");
  node->SetAttribute("layer", "L1");

  TiXmlElement *translate = new TiXmlElement( "translate" );
  node->LinkEndChild( translate );
  translate->SetAttribute("sid", "translate");
  translate->LinkEndChild( new TiXmlText( "0.0 0.0 0.0" ));

  TiXmlElement *rotate = new TiXmlElement( "rotate" );
  node->LinkEndChild( rotate );
  rotate->SetAttribute("sid", "rotateZ");
  rotate->LinkEndChild( new TiXmlText( "0.0 0.0 1.0 0.0" ));

  rotate = new TiXmlElement( "rotate" );
  node->LinkEndChild( rotate );
  rotate->SetAttribute("sid", "rotateY");
  rotate->LinkEndChild( new TiXmlText( "0.0 1.0 0.0 0.0" ));

  rotate = new TiXmlElement( "rotate" );
  node->LinkEndChild( rotate );
  rotate->SetAttribute("sid", "rotateX");
  rotate->LinkEndChild( new TiXmlText( "1.0 0.0 0.0 0.0" ));

  TiXmlElement *scale = new TiXmlElement( "scale" );
  node->LinkEndChild( scale );
  scale->SetAttribute("sid", "scale");
  scale->LinkEndChild( new TiXmlText( "1.0 1.0 1.0" ));

  TiXmlElement *instance_geometry = new TiXmlElement( "instance_geometry" );
  node->LinkEndChild( instance_geometry );
  instance_geometry->SetAttribute("url", "#mesh001");

  TiXmlElement *bind_material = new TiXmlElement( "bind_material" );
  instance_geometry->LinkEndChild( bind_material );

  TiXmlElement *techniqueCommon = new TiXmlElement( "technique_common" );
  bind_material->LinkEndChild( techniqueCommon );

  TiXmlElement *instanceMaterial = new TiXmlElement( "instance_material" );
  techniqueCommon->LinkEndChild( instanceMaterial );
  instanceMaterial->SetAttribute("symbol", "material");
  instanceMaterial->SetAttribute("target", "#material0");

  TiXmlElement *bindVertexInput = new TiXmlElement( "bind_vertex_input" );
  instanceMaterial->LinkEndChild( bindVertexInput );
  bindVertexInput->SetAttribute("semantic", "UVSET0");
  bindVertexInput->SetAttribute("input_semantic", "TEXCOORD");

  // library_images
  TiXmlElement *libraryImages = new TiXmlElement( "library_images" );
  collada->LinkEndChild( libraryImages );

  TiXmlElement *image = new TiXmlElement( "material" );
  libraryImages->LinkEndChild( image );
  image->SetAttribute("id", "texture0");
  image->SetAttribute("name", "texture0");

  TiXmlElement *imageInitFrom = new TiXmlElement( "init_from" );
  image->LinkEndChild( imageInitFrom );
  imageInitFrom->LinkEndChild( new TiXmlText( "test.png" ));

  // library_materials
  TiXmlElement *libraryMaterials = new TiXmlElement( "library_materials" );
  collada->LinkEndChild( libraryMaterials );

  TiXmlElement *material = new TiXmlElement( "material" );
  libraryMaterials->LinkEndChild( material );
  material->SetAttribute("id", "material0");
  material->SetAttribute("name", "material0");

  TiXmlElement *instanceEffect = new TiXmlElement( "instance_effect" );
  material->LinkEndChild( instanceEffect );
  instanceEffect->SetAttribute("url", "#material0-fx");

  // library_effects
  TiXmlElement *libraryEffects = new TiXmlElement( "library_effects" );
  collada->LinkEndChild( libraryEffects );

  TiXmlElement *effect = new TiXmlElement( "effect" );
  libraryEffects->LinkEndChild( effect );
  effect->SetAttribute("id", "material0-fx");

  TiXmlElement *profileCommon = new TiXmlElement( "profile_COMMON" );
  effect->LinkEndChild( profileCommon );

  TiXmlElement *newParam = new TiXmlElement( "newparam" );
  profileCommon->LinkEndChild( newParam );
  newParam->SetAttribute("sid", "texture0-surface");

  TiXmlElement *surface = new TiXmlElement( "surface" );
  newParam->LinkEndChild( surface );
  surface->SetAttribute("type", "2D");

  TiXmlElement *initFrom = new TiXmlElement( "init_from" );
  surface->LinkEndChild( initFrom );
  initFrom->LinkEndChild( new TiXmlText( "texture0" ));

  TiXmlElement *format = new TiXmlElement( "format" );
  surface->LinkEndChild( format );
  format->LinkEndChild( new TiXmlText( "R8G8B8" ));

  TiXmlElement *technique = new TiXmlElement( "technique" );
  profileCommon->LinkEndChild( technique );
  newParam->SetAttribute("sid", "common");

  TiXmlElement *phong = new TiXmlElement( "phong" );
  technique->LinkEndChild( phong );

  TiXmlElement *emmision = new TiXmlElement( "emission" );
  phong->LinkEndChild( emmision );
  TiXmlElement *emmisionColor = new TiXmlElement( "color" );
  emmision->LinkEndChild( emmisionColor );
  emmisionColor->LinkEndChild( new TiXmlText( "0 0 0 1" ));

  TiXmlElement *ambient = new TiXmlElement( "ambient" );
  phong->LinkEndChild( ambient );
  TiXmlElement *ambientColor = new TiXmlElement( "color" );
  ambient->LinkEndChild( ambientColor );
  ambientColor->LinkEndChild( new TiXmlText( "0 0 0 1" ));

  TiXmlElement *diffuse = new TiXmlElement( "diffuse" );
  phong->LinkEndChild( diffuse );
  TiXmlElement *diffuseTexture = new TiXmlElement( "texture" );
  diffuse->LinkEndChild( diffuseTexture );
  diffuseTexture->SetAttribute("texture", "texture0");
  diffuseTexture->SetAttribute("texcoord", "UVSET0");

  TiXmlElement *specular = new TiXmlElement( "specular" );
  phong->LinkEndChild( specular );
  TiXmlElement *specularColor = new TiXmlElement( "color" );
  specular->LinkEndChild( specularColor );
  specularColor->LinkEndChild( new TiXmlText( "0.5 0.5 0.5 1" ));

  // scene
  TiXmlElement *scene = new TiXmlElement( "scene" );
  collada->LinkEndChild( scene );

  TiXmlElement *instance_visual_scene = new TiXmlElement( "instance_visual_scene" );
  scene->LinkEndChild( instance_visual_scene );
  instance_visual_scene->SetAttribute("url", "#Scene");

  return(daeOut);
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

  TiXmlDocument daeIn( argv[1] );
  if (!daeIn.LoadFile())
  {
    gzerr << "Could not open dae file." << std::endl;
    return -1;
  }

  std::string filename = argv[1];
  filename = filename.substr(0, filename.find(".dae"));

  // load collada mesh into Gazebo Mesh format
  const gazebo::common::Mesh *m1 =
      gazebo::common::MeshManager::Instance()->Load(argv[1]);

  GtsSurface *s1;
  GNode *tree1;
  s1 = gts_surface_new(gts_surface_class(), gts_face_class(), gts_edge_class(),
      gts_vertex_class());

  // convert Gazebo Mesh to GTS format
  ConvertMeshToGTS(m1, s1);

  /*** Do mesh simplification here ***/

  // Number of edges
  guint edgesBefore = gts_surface_edge_number(s1);
  std::cout << "Edges before: " << edgesBefore << std::endl;

  if (edgesBefore < 300)
  {
    gzwarn << "There are less than 300 edges. Not simplifying.\n";
    return -1;
  }

  // print stats
  /*gts_surface_print_stats (s1, stderr);
  fprintf (stderr, "# volume: %g area: %g\n",
  	     gts_surface_volume (s1), gts_surface_area (s1));*/

  // default cost function COST_OPTIMIZED
  GtsKeyFunc cost_func = (GtsKeyFunc) gts_volume_optimized_cost;
  GtsVolumeOptimizedParams params = { 0.5, 0.5, 0. };
  gpointer cost_data = &params;

  // default coarsen function OPTIMIZED
  GtsCoarsenFunc coarsen_func = (GtsCoarsenFunc) gts_volume_optimized_vertex;
  gpointer coarsen_data = &params;

  // set stop to number
  GtsStopFunc stop_func = (GtsStopFunc) stop_number_verbose;
  guint number = edgesBefore * atoi (argv[2])/100;
  gpointer stop_data = &number;

  // maximum fold angle
  gdouble fold = PI/180.;

  // coarsen
  gts_surface_coarsen (s1,
      cost_func, cost_data,
      coarsen_func, coarsen_data,
      stop_func, stop_data, fold);

  // Number of edges
  guint edgesAfter = gts_surface_edge_number(s1);
  std::cout << std::endl << "Edges after: " << edgesAfter << std::endl;

  // stats after coarsening
  /*gts_surface_print_stats (s1, stderr);
  fprintf (stderr, "# volume: %g area: %g\n",
	     gts_surface_volume (s1), gts_surface_area (s1));*/

  /*** End mesh simplification ***/

  // create output Gazebo mesh
  gazebo::common::Mesh *mesh = new gazebo::common::Mesh();
  gazebo::common::SubMesh *subMesh = new gazebo::common::SubMesh();
  mesh->AddSubMesh(subMesh);

  // fill the submesh with data generated by GTS
  unsigned int n;
  gpointer data[3];
  GHashTable *vIndex = g_hash_table_new(NULL, NULL);

  data[0] = subMesh;
  data[1] = &n;
  data[2] = vIndex;
  n = 0;
  gts_surface_foreach_vertex(s1, (GtsFunc)FillVertex, data);
  n = 0;
  gts_surface_foreach_face(s1, (GtsFunc)FillFace, data);
  g_hash_table_destroy(vIndex);

  // Calculate normals
  // For some reason, RecalculateNormals only works from more than 3
//  subMesh->SetNormalCount(4);
  mesh->RecalculateNormals();

  // Generate texture coordinates
  gazebo::math::Vector3 center;
  center.Set(0,0,0);
  mesh->GenSphericalTexCoord(center);

  // Primitive: triangles
  //std::cout << "GetPrimitiveType(): " << subMesh->GetPrimitiveType() << std::endl;

  /*** Export as COLLADA ***/

  TiXmlDocument dae;
  const gazebo::common::SubMesh *submesh = mesh->GetSubMesh(0);

  dae = ConvertMeshToDae(daeIn,subMesh);

  dae.SaveFile( filename+"_coarse.dae" );


  /*** End export as COLLADA ***/

  // destroy surfaces
  gts_object_destroy(GTS_OBJECT(s1));

  return 0;
}
