#ifndef _OGRE_MATERIAL_PARSER_HH_
#define _OGRE_MATERIAL_PARSER_HH_

#include <string>

namespace gzweb
{
  class ConfigNode;
  class ConfigLoader;

  class OgreMaterialParser
  {
    public: OgreMaterialParser();

    public: virtual ~OgreMaterialParser();

    public: void Load(const std::string &_path);

    public: std::string GetMaterialAsJson() const;

    private: ConfigLoader *configLoader;
  };

}

#endif
