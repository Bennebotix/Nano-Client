(function(cli){

    cli.path = [];

    cli.filesystem = {
        user: {
            downloads: {
            }
        },
        reload: () => window.location.reload()
    }

    cli.get_dir = function(path){
        var current_dir = cli.filesystem;
        for(var index in path){
            if(typeof current_dir[path[index]] != "object")return false;
            current_dir = current_dir[path[index]];
        }
        return current_dir;
    }

    cli.currentDir = cli.filesystem;

    cli.hiddenCommands.push('ls');

    cli.extend('ls',function(command,cli){
        cli.nl().write('Contents of C:\\'+cli.path.join('\\').toUpperCase()).nl();
        var files = [];
        for(var filename in cli.currentDir){
            if(cli.currentDir.hasOwnProperty(filename)){
                if(typeof cli.currentDir[filename] == 'function')files.push(filename);
                else cli.write('['+filename+']');
            }
        }
        for(var indx in files){
            cli.write(files[indx]);
        }

        console.log(files);
        cli.nl();
    });

    cli.hiddenCommands.push('exec');

    cli.extend('exec',function(command,cli){
        var filename = command.parametersText;
        if(cli.currentDir.hasOwnProperty(filename)) {
            if(typeof cli.currentDir[filename] == 'function') cli.currentDir[filename]();
            else cli.write('"'+filename+'" is not an executable!');
        } else cli.write('Could not find executable: "'+filename+'"');
        cli.nl();
    });

    cli.hiddenCommands.push('nano');

    cli.extend('nano',function(command,cli){
        if (command.parametersText.split(' ').length == 1) {
            cli.typing = false;
            var modal = document.createElement('div');
            modal.classList.add('modal');
    
            var fileExtension = command.parametersText.match(/\.(txt|js|html|css)/i);

            alert(fileExtension);
    
            modal.innerHTML = `
                <div class="modal">
                    <pre class="ft-syntax-highlight" data-syntax="html" data-syntax-theme="one-dark">
                        <code contenteditable="true">
                            ${cli.boilerplates[fileExtension]}
                        </code>
                    </pre>
    
                    <button>Cancel</button>
                    <button>Save</button>
                </div>
            `;
            document.body.appendChild(modal);
            document.querySelector('textarea').focus();
        } else {
        }
    });

    cli.hiddenCommands.push('cd');

    cli.extend('cd',function(command,cli){

        // "command.parametersText" is entire text for params
        // Example: "cmd 1 2", "command.parametersText" would be "1 2"

        // "cli.path.pop()" Go Back

        // "cli.currentDir" is the filesystem object

        // "cli.path" is an arr like "['user', 'downloads']"
        
        cli.commandline_prepend= 'C:\\'+cli.path.join('\\')+'>';

    });

    cli.hiddenCommands.push('path');
    cli.extend('path',function(command,cli){
        cli.write(cli.path.join('\\'));

    });
})(CLI);
