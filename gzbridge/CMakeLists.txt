include (${gzweb_cmake_dir}/Utils.cmake)


include_directories(
  ${PROJECT_SOURCE_DIR}/deps/libwebsockets/lib
)

set (sources
  gzbridge.cc
)




add_executable(gzbridge ${sources})

target_link_libraries(gzbridge websockets_shared)
#add_dependencies(${TEST_NAME} websockets_shared)


# Set test app specific defines.
set_property(TARGET gzbridge
			PROPERTY COMPILE_DEFINITIONS
				INSTALL_DATADIR="${CMAKE_INSTALL_PREFIX}/share"
			)
