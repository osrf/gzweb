{
  "targets": [
    {
      "target_name": "gzbridge",
      "sources": [ "GZNode.cc", "GZNode.hh", "GazeboInterface.cc", 
        "GazeboInterface.hh", "pb2json.cc", "pb2json.hh" ],
      'cflags_cc!': [ '-fno-rtti', '-fno-exceptions' ],
      'cflags!': [ '-fno-exceptions' ],
      "conditions": [        
        ['OS=="linux"', {
          'cflags': [
            '<!@(pkg-config --cflags gazebo jansson protobuf)'
          ],
          'ldflags': [
            '<!@(pkg-config --libs-only-L --libs-only-other gazebo jansson protobuf)'
          ],
          'libraries': [
            '<!@(pkg-config --libs-only-l gazebo jansson protobuf)'
          ]
        }]
      ]
    }
  ]
}
