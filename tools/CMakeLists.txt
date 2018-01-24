include_directories(
  include_directories(${GAZEBO_INCLUDE_DIRS})
)

if (HAVE_GTS)
  include_directories(${GTS_INCLUDE_DIRS})
  link_directories(${GTS_LIBRARY_DIRS})
  add_definitions(${GTS_CFLAGS})
endif()

link_directories(${GAZEBO_LIBRARY_DIRS})

set (CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11")

set (sources
  gzcoarse.cc
)

set_property(
  SOURCE ${sources}
  PROPERTY COMPILE_DEFINITIONS
  GAZEBO_MAJOR_VERSION=${GAZEBO_MAJOR_VERSION}
)

add_executable(gzcoarse ${sources})

target_link_libraries(gzcoarse ${GAZEBO_LIBRARIES}
    ${Boost_LIBRARIES} ${GTS_LIBRARIES} ${tinyxml_libraries})

