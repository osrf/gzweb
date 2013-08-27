include_directories(
  include_directories(${GAZEBO_INCLUDE_DIRS})
  ${PROJECT_SOURCE_DIR}/deps/libwebsockets/lib
)

link_directories(${GAZEBO_LIBRARY_DIRS})

set (sources
  pb2json.cc
  GazeboInterface.cc
  pb2json.cc
)

set (headers
  pb2json.hh
  GazeboInterface.hh
)

# add_executable(gzbridge ${sources})

# target_link_libraries(gzbridge websockets_shared ${GAZEBO_LIBRARIES} ${Boost_LIBRARIES} ${PROTOBUF_LIBRARIES} ${JANSSON_LIBRARIES})
#add_dependencies(${TEST_NAME} websockets_shared)

# Set test app specific defines.
# set_property(TARGET gzbridge
#      PROPERTY COMPILE_DEFINITIONS
#        INSTALL_DATADIR="${CMAKE_INSTALL_PREFIX}/share"
#      )
