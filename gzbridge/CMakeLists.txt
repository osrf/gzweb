include (${gzweb_cmake_dir}/Utils.cmake)


include_directories(
  ${PROJECT_SOURCE_DIR}/deps/libwebsockets/lib
)

set (sources
  gzbridge.cc
#  listener.cc
  WebSocketServer.cc
)

set (headers
  WebSocketServer.cc
)


# add_executable(listener listener.cc)
# target_link_libraries(listener ${GAZEBO_LIBRARIES} ${Boost_LIBRARIES} ${PROTOBUF_LIBRARIES})

add_executable(gzbridge ${sources})

target_link_libraries(gzbridge websockets_shared ${GAZEBO_LIBRARIES} ${Boost_LIBRARIES} ${PROTOBUF_LIBRARIES})
#add_dependencies(${TEST_NAME} websockets_shared)

# Set test app specific defines.
set_property(TARGET gzbridge
			PROPERTY COMPILE_DEFINITIONS
				INSTALL_DATADIR="${CMAKE_INSTALL_PREFIX}/share"
			)
