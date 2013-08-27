set (dest ${CMAKE_SOURCE_DIR}/http)
set (files client)
file(COPY ${files} DESTINATION ${dest})
file(COPY build/gz3d.js build/gz3d.min.js DESTINATION ${dest}/client/ )
