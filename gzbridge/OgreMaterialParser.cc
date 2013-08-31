#include <iostream>

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
        ConfigNode *textureUnitNode = passNode->findChild("texture_unit");
        if (textureUnitNode)
        {
          ConfigNode *textureNode = textureUnitNode->findChild("texture");
          if (textureNode)
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
            std::string textureStr = textureNode->getValue(0);
            jsonStr += "\"" + name + "\" : \"" + textureStr + "\"";
          }
        }
      }
    }

  }

  jsonStr += "}";

  return jsonStr;
}
