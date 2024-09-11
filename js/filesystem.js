(function(cli){

    cli.path = [];

    cli.filesystem = {
        hi: () => alert('hi')
    }

    cli.get_dir = function(path){
        var current_dir = cli.filesystem;
        for(index in path){
            if(typeof current_dir[path[index]] != "object")return false;
            current_dir = current_dir[path[index]];
        }
        return current_dir;
    }

    cli.currentDir = cli.filesystem;

    cli.hiddenCommands.push('dir');

    cli.extend('dir',function(command,cli){
        cli.nl().write('Contents of C:\\'+cli.path.join('\\').toUpperCase()).nl();
        var files = [];
        for(var filename in cli.currentDir){
            if(cli.currentDir.hasOwnProperty(filename)){
                if(typeof cli.currentDir[filename] == 'function')files.push(filename);
                else cli.write('['+filename.toUpperCase()+']');
            }
        }
        for(var indx in files){
            cli.write(files[indx]);
        }

        console.log(files);
        cli.nl();
    });

    /*cli.hiddenCommands.push('exec');

    cli.extend('exec',function(command,cli){
        var fileName = command.parametersText;
        if(cli.currentDir.hasOwnProperty(filename)){
            if(typeof cli.currentDir[filename] == 'function') {
                cli.currentDir[filename]();
            } else cli.write('"'+filename+'" is not an executable!');
        } else cli.write('Could not find executable: "'+filename+'"');
        cli.nl();
    }*/

    cli.hiddenCommands.push('cd');

    cli.extend('cd',function(command,cli){

        if(command.parametersText == '..'){
            cli.path.pop();
            cli.currentDir = cli.get_dir(cli.path);
        }
        else if(typeof cli.currentDir != 'undefined' && cli.currentDir.hasOwnProperty(command.parametersText.toLowerCase()) && typeof cli.currentDir[command.parametersText.toLowerCase()] == 'object'){
            cli.path.push(command.parametersText.toLowerCase());
            cli.currentDir = cli.get_dir(cli.path);
        }
        else cli.write('Could not find directory "'+command.parametersText+'"');
        cli.commandline_prepend= 'C:\\'+cli.path.join('\\').toUpperCase()+'>';

    });

    cli.hiddenCommands.push('path');
    cli.extend('path',function(command,cli){
        cli.write(cli.path.join('\\').toUpperCase());

    });
})(CLI);
