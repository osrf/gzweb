add_subdirectory(libwebsockets)

# ExternalProject_Add(libwebsockets
#                     UPDATE_COMMAND true
#                     PATCH_COMMAND true
#                     SOURCE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/libwebsockets
#                     BINARY_DIR ${CMAKE_CURRENT_BINARY_DIR}/libwebsockets
#                     BUILD_COMMAND make
#                     CMAKE_ARGS
#                       -DPKG_CONFIG_PATH=${PKG_CONFIG_PATH}:$ENV{PKG_CONFIG_PATH}
#                       -DCMAKE_INSTALL_PREFIX=${CMAKE_INSTALL_PREFIX}
#                     INSTALL_COMMAND ""
#                     )
# install(CODE "execute_process(COMMAND make -C ${CMAKE_CURRENT_BINARY_DIR}/libwebsockets install)")
