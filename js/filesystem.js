(function(cli){

    class cli.File {
        constructor(name, callback) {
            this.name = name;
            this.callback = callback;
            this.type = 'file';
        }

        exec() {
            this.callback();
        }
    }

    cli.path = new PathObject(".", "/root"); // Root is /root, not just a default path

    cli.filesystem = [
        new cli.File('reload', window.location.reload)
    ]

    cli.get_dir = function(path){
        var current_dir = cli.filesystem;
        for(var index in path){
            if(typeof current_dir[path[index]] != "object")return false;
            current_dir = current_dir[path[index]];
        }
        return current_dir;
    }

    cli.hiddenCommands.push('ls');

    cli.extend('ls',function(command,cli){
        cli.nl().write('Contents of ' + cli.path.toString().replace("\\", "/").toUpperCase()).nl();
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
        cli.filesystem(flie => {
            if (file.name == filename && file.type == 'file') {
                file.exec();
            }
        })
        if(cli.filesystem.hasOwnProperty(filename)) {
            if(typeof cli.filesystem[filename] == 'function') cli.filesystem[filename].exec();
            else cli.write('"'+filename+'" is not an executable!');
        } else cli.write('Could not find executable: "'+filename+'"');
        cli.nl();
    });

    cli.hiddenCommands.push('nano');

    cli.extend('nano',function(command,cli){
        if (command.parametersText.split(' ').length == 1 && command.parametersText) {
            cli.typing = false;
            var modal = document.createElement('div');
            modal.classList.add('modal');
    
            var fileExtension = command.parametersText.match(/\.(txt|js|html|css)/i)[1];
    
            modal.innerHTML = `
                <div class="modal">

                    <div style="height: 200px;">
                        <textarea placeholder="Enter HTML Source Code" id="editing" spellcheck="false" oninput="highlight(this.value); sync_scroll(this);" onscroll="sync_scroll(this);" onkeydown="check_tab(this, event);"></textarea>
                        <pre id="highlighting" aria-hidden="true">
                            <code class="language-html highlight">
                            </code>
                        </pre>
                    </div>
                
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
        
        cli.path.applyRelative(command.parametersText)

        let cdPath = cli.path.toString().replace("\\", "/");
        
        cli.commandline_prepend = (cdPath == '/root' ? '/root~' : cdPath) + ' >';

    });

    cli.hiddenCommands.push('path');
    cli.extend('path',function(command,cli){
        // Alias: pwd?
        cli.write(cli.path.toString().replace("\\", "/"));

    });
})(CLI);
