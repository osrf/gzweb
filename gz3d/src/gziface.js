GZ3D.GZIface = function(scene)
{
  this.scene = scene;
  this.Init();
};

GZ3D.GZIface.prototype.Init = function(scene)
{
  this.webSocket = new ROSLIB.Ros({
    url : 'ws://localhost:7681'
  });

  var sceneTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/scene',
    messageType : '/scene',
  });
    console.log('new topic');


  var SceneUpdate = function(message)
  {
    for (var i = 0; i < message.model.length; ++i)
    {
      var model = message.model[i];

      var modelObj = new THREE.Object3D();
      if (model.pose)
      {
        modelObj.position.x = model.pose.position.x;
        modelObj.position.y = model.pose.position.y;
        modelObj.position.z = model.pose.position.z;
        modelObj.quaternion.w = model.pose.orientation.w;
        modelObj.quaternion.x = model.pose.orientation.x;
        modelObj.quaternion.y = model.pose.orientation.y;
        modelObj.quaternion.z = model.pose.orientation.z;
      }
      for (var j = 0; j < model.link.length; ++j)
      {
        var link = model.link[j];
        var linkObj = new THREE.Object3D();
        if (link.pose)
        {
          linkObj.position.x = link.pose.position.x;
          linkObj.position.y = link.pose.position.y;
          linkObj.position.z = link.pose.position.z;
          linkObj.quaternion.w = link.pose.orientation.w;
          linkObj.quaternion.x = link.pose.orientation.x;
          linkObj.quaternion.y = link.pose.orientation.y;
          linkObj.quaternion.z = link.pose.orientation.z;
        }
        modelObj.add(linkObj);
        for (var k = 0; k < link.visual.length; ++k)
        {
          var visual = link.visual[k];
            console.log ('sdf' + visual.name);
          if (visual.geometry)
          {
            var geom = visual.geometry;
            var visualObj = new THREE.Object3D();
            if (visual.pose)
            {
              visualObj.position.x = visual.pose.position.x;
              visualObj.position.y = visual.pose.position.y;
              visualObj.position.z = visual.pose.position.z;
              visualObj.quaternion.w = visual.pose.orientation.w;
              visualObj.quaternion.x = visual.pose.orientation.x;
              visualObj.quaternion.y = visual.pose.orientation.y;
              visualObj.quaternion.z = visual.pose.orientation.z;
            }
//            mat = findMaterial(material);
            console.log (visual.name);
            this.scene.CreateGeom(geom, visual.material, visualObj);
            linkObj.add(visualObj);

          }
        }
      }
      this.scene.Add(modelObj);
    }




//    visuals['ian'].position.x = message.posX;
//    visuals['ian'].updateMatrix();
  //          setInterval(onReceiveMessage,0.1);
  };

  sceneTopic.subscribe(SceneUpdate.bind(this));

/*
  var updateTopic2 = new ROSLIB.Topic({
    ros : webSocket,
    name : '/topic2',
    messageType : '/msg',
  });
    //console.log("new topic");

  processUpdate2 = function(message)
  {
    console.log("process update2 " + message.posY);

    visuals['ian'].position.y = message.posY;
    visuals['ian'].updateMatrix();
  //          setInterval(onReceiveMessage,0.1);

  }
  //      updateTopic2.subscribe(processUpdate2.bind());

  var updateTopic3 = new ROSLIB.Topic({
    ros : webSocket,
    name : '/topic3',
    messageType : '/msg',
  });
    //console.log("new topic");

  processUpdate3 = function(message)
  {
    console.log("process update3 " + message.posZ);

    visuals['ian'].position.z = message.posZ;
    visuals['ian'].updateMatrix();
  //          setInterval(onReceiveMessage,0.1);

  }
  //   updateTopic3.subscribe(processUpdate3.bind());*/

};
