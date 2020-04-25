#include "gtest/gtest.h"

#include "pb2json.hh"

using namespace gzweb;

TEST(pb2json, JsonObj)
{
  // create json test string
  std::string testJsonStr =
      "{\
        \"double\": 0.3,\
        \"float\": 0.4,\
        \"int\": -98,\
        \"bool\": false,\
        \"string\": \"test_string\",\
        \"array\": [10, 22, 37],\
        \"obj\":\
            {\"obj_double\": 30.78,\
             \"obj_float\": -9.13,\
             \"obj_int\": 888,\
             \"obj_bool\": true,\
             \"obj_string\": \"obj_test_string\",\
             \"obj_array\": [{\"obj_idx_0\": 3.1}]\
            }\
       }";

  // create object and test bool operator
  JsonObj jsonObj(testJsonStr);
  EXPECT_TRUE(jsonObj);

  // test fields
  EXPECT_DOUBLE_EQ(0.3, jsonObj.Object("double").Number());
  EXPECT_FLOAT_EQ(0.4, jsonObj.Object("float").Number());
  EXPECT_EQ(-98, jsonObj.Object("int").Number());
  EXPECT_FALSE(jsonObj.Object("bool").Bool());
  EXPECT_EQ("test_string", jsonObj.Object("string").String());
  EXPECT_EQ(3, jsonObj.Object("array").ArraySize());
  EXPECT_EQ(10, jsonObj.Object("array").ArrayObject(0).Number());
  EXPECT_EQ(22, jsonObj.Object("array").ArrayObject(1).Number());
  EXPECT_EQ(37, jsonObj.Object("array").ArrayObject(2).Number());

  // test nested json obj
  JsonObj nested = jsonObj.Object("obj");
  EXPECT_TRUE(nested);
  EXPECT_DOUBLE_EQ(30.78, nested.Object("obj_double").Number());
  EXPECT_FLOAT_EQ(-9.13, nested.Object("obj_float").Number());
  EXPECT_EQ(888, nested.Object("obj_int").Number());
  EXPECT_TRUE(nested.Object("obj_bool").Bool());
  EXPECT_EQ("obj_test_string", nested.Object("obj_string").String());
  EXPECT_EQ(1, nested.Object("obj_array").ArraySize());
  EXPECT_EQ(3.1, nested.Object("obj_array").ArrayObject(0).Object(
      "obj_idx_0").Number());

  // test copy
  JsonObj copy = jsonObj;
  EXPECT_TRUE(copy);
  EXPECT_DOUBLE_EQ(0.3, copy.Object("double").Number());

  JsonObj copyNested(nested);
  EXPECT_DOUBLE_EQ(30.78, copyNested.Object("obj_double").Number());
}

int main(int argc, char** argv)
{
  ::testing::InitGoogleTest(&argc, argv);
  return RUN_ALL_TESTS();
}
