#!/usr/bin/env bash

if tput setaf 1 &> /dev/null; then
  purple=$(tput setaf 141)
  blue=$(tput setaf 153)
  bold=$(tput bold)
  reset=$(tput sgr0)
else
  purple=""
  blue=""
  bold=""
  reset=""
fi

command -v meteor >/dev/null 2>&1 || {
echo "Vulcan requires Meteor but it's not installed. Trying to Install..." >&2;

if [ "$(uname)" == "Darwin" ]; then
    # Mac OS platform
   echo "🌋  ${bold}${purple}Good news you have a Mac and we will install it now! ${reset}";
   curl https://install.meteor.com/ | bash;
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    # GNU/Linux platform
    echo "🌋  ${bold}${purple}Good news you are on  GNU/Linux platform and we will install Meteor now! ${reset}";
    curl https://install.meteor.com/ | bash;
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]; then
    # Windows NT platform
    echo "🌋  ${bold}${purple}Oh no! you are on a Windows platform and you will need to install Meteor Manually! ${reset}";
    echo "📖  ${blue}Meteor for Windows is available at: ${purple}https://install.meteor.com/windows";
    exit;
fi

}


test -f settings.json || (echo "🛠  ${blue}Creating your own settings.json file...\n"; cp sample_settings.json settings.json;)

test -f settings-dev.json || (echo "🛠  ${blue}Creating your own settings-dev.json file...\n"; cp sample_settings.json settings-dev.json;)

echo "🌋  ${bold}${purple}Welcome to the LessWrong development server!${reset}";

echo "📖  ${blue}We are using Vulcan, whose docs are available at: ${purple}http://docs.vulcanjs.org";
echo "📖  ${blue}You can find our Github repo here: ${purple}https://github.com/Lesswrong2/LessWrong2/tree/devel";

if tput setaf 1 &> /dev/null; then
  tput sgr0;
fi
