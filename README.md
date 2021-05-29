# siemens-task README

This is a simple extensions to allow using ansible tasks inside a devcontainer.
created by daniloprevides@gmail.com

## Features

Allow the use of ansible playbook inside a dev container

## Requirements

ansible must be installed and running.
https://www.ansible.com/

## Extension Settings

This extension contributes the following settings:

* `ansible-container.containerPath`: The path to tasks folder inside workspace (Default: .devcontainer/tasks)
* `ansible-container.ansibleCommand`: The path to ansible-playbook command (Default: ansible-playbook)
