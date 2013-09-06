#include <iostream>
#include <sstream>

#include "ConfigLoader.hh"
#include "OgreMaterialParser.hh"

using namespace gzweb;

/////////////////////////////////////////////////
OgreMaterialParser::OgreMaterialParser()
{
  this->configLoader = new ConfigLoader(".material");
}

/////////////////////////////////////////////////
OgreMaterialParser::~OgreMaterialParser()
{
  delete this->configLoader;
}

/////////////////////////////////////////////////
void OgreMaterialParser::Load(const std::string &_path)
{
  ConfigLoader::loadAllFiles(this->configLoader, _path);
}

/////////////////////////////////////////////////
std::string OgreMaterialParser::GetMaterialAsJson() const
{
  std::string jsonStr = "{";

  std::map<std::string, ConfigNode *> scripts =
      this->configLoader->getAllConfigScripts();

  std::map<std::string, ConfigNode *>::iterator it;
  bool first = true;
  for (it = scripts.begin(); it != scripts.end(); ++it)
  {
    std::string name = it->first;
    ConfigNode *node = it->second;

    ConfigNode *techniqueNode = node->findChild("technique");
    if (techniqueNode)
    {
      ConfigNode *passNode = techniqueNode->findChild("pass");
      if (passNode)
      {
        if (!first)
          jsonStr += ", ";
        else
          first = false;

        std::size_t index = name.rfind(" ");
        if (index != std::string::npos)
        {
          name = name.substr(index+1);
        }
        jsonStr += "\"" + name + "\":{";

        ConfigNode *ambientNode = passNode->findChild("ambient");
        if (ambientNode)
        {
          std::stringstream ss;
          ss << ambientNode->getValue(0) << ","
              << ambientNode->getValue(1) << ","
              << ambientNode->getValue(2) << ","
              << ambientNode->getValue(3);
          jsonStr += "\"ambient\":[" + ss.str() + "],";
        }

        ConfigNode *diffuseNode = passNode->findChild("diffuse");
        if (diffuseNode)
        {
          std::stringstream ss;
          ss << diffuseNode->getValue(0) << ","
              << diffuseNode->getValue(1) << ","
              << diffuseNode->getValue(2) << ","
              << diffuseNode->getValue(3);
          jsonStr += "\"diffuse\":[" + ss.str() + "],";
        }

        ConfigNode *specularNode = passNode->findChild("specular");
        if (specularNode)
        {
          std::stringstream ss;
          ss << specularNode->getValue(0) << ","
              << specularNode->getValue(1) << ","
              << specularNode->getValue(2) << ","
              << specularNode->getValue(3);
          jsonStr += "\"specular\":[" + ss.str() + "],";
        }

        ConfigNode *textureUnitNode = passNode->findChild("texture_unit");
        if (textureUnitNode)
        {
          ConfigNode *textureNode = textureUnitNode->findChild("texture");
          if (textureNode)
          {
            std::string textureStr = textureNode->getValue(0);
            index = textureStr.rfind(".");
            if (index != std::string::npos)
            {
              textureStr = textureStr.substr(0, index+1) + "png";
            }

            jsonStr += "\"texture\":\"" + textureStr + "\"";
          }
        }
        if (jsonStr[jsonStr.size()-1] == ',')
        {
          jsonStr = jsonStr.substr(0, jsonStr.size()-1);
        }
        jsonStr += "}";
      }
    }

  }

  jsonStr += "}";

  std::cout << jsonStr << std::endl;

  return jsonStr;
}
