(function(cli){

    cli.hiddenCommands = ['notif', 'rebootserviceworker', 'cls','motd','barn','test','reset','command_with_error','centered','line','list','mit','trash'];

    cli.extend('rebootserviceworker',function(data,cli){
        if (navigator.onLine) {
            serviceWorkerRegistration.unregister();
            window.location.reload();
        } else {
            cli.write('Client is not online!');
        }
    })
    
    cli.extend('notif',function(data,cli){
        cli.notif(...eval(data.parametersText));
    });

    cli.extend('update',function(data,cli){
        var i = 0;
        setInterval(() => {
            if (i < 15) {
                if (navigator.onLine) {
                    serviceWorkerRegistration.unregister();
                    window.location.reload();
                } else {
                    cli.write('Client is not online!');
                }
            }
        }, 10)
    });
    
    cli.extend('help',function(data,cli){

        cli.nl().write('Following commands are available:').nl();
        for(var command in cli.commands){
            if(cli.hiddenCommands.indexOf(command)==-1) cli.write('  - '+command);
        }
        cli.nl();
    });

    cli.extend('barn',function(data,cli){
        //cli.clear();
        cli.write('\n<span style="color:#0f0">           x\n.-. _______|\n|=|/     /  \\\n| |_____|_""_|\n|_|_[X]_|____|\n</span>');
    });

    cli.extend('motd',function(data,cli){
        cli.clear();
        cli.nl();
        var dim = cli.calculateDim();

        var pipes = ' ║'+' '.repeat(dim-4)+'║ ';

        var write_c = function(string,pipe){
            if(typeof pipe == 'undefined')pipe = '║';
            var off = Math.floor((dim - string.replace(/(<([^>]+)>)/ig,"").length)/2);
            cli.write(' '+pipe+ ' '.repeat(off)+string+' '.repeat(dim - string.replace(/(<([^>]+)>)/ig,"").length - off - 4)+pipe+' ')
        }

        cli.write(' ╔'+'═'.repeat(dim-4)+'╗ ').
            write(pipes);
        write_c('Welcome.');
        cli.write(pipes);
        write_c('Written in JavaScript.');
        cli.write(pipes);
        write_c('Made with Mega Bitz v2.');
        cli.write(pipes);
        write_c('Type <b>help</b> for list of commands.');
        cli.write(pipes).
            write(' ╟'+'─'.repeat(dim-4)+'╢ ').
            write(pipes);
        write_c('(c) Bennebotix, 2024. Released under <a href="#" onclick="CLI.run(\'mit\');">MIT</a>.');

        cli.write(pipes).
            write(' ╚'+'═'.repeat(dim-4)+'╝ ').nl();
        write_c('The <a href="https://github.com/Bennebotix/Nano-Client">GitHub repository</a>',' ');
    });
    
    cli.extend('mit',function(data,cli){
        cli.write(' ').nl().write('The MIT License (MIT)').nl().write('<a href="http://opensource.org/licenses/MIT">http://opensource.org/licenses/MIT</a>').nl();
        cli.write(
'Permission is hereby granted, free of charge, to any person obtaining a copy'+
' of this software and associated documentation files (the "Software"), to deal'+
' in the Software without restriction, including without limitation the rights'+
' to use, copy, modify, merge, publish, distribute, sublicense, and/or sell'+
' copies of the Software, and to permit persons to whom the Software is'+
' furnished to do so, subject to the following conditions:').nl();
        cli.write(
'<b>The above copyright notice and this permission notice shall be included in'+
' all copies or substantial portions of the Software.</b>').nl();
        cli.write(
'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR'+
' IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,'+
' FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE'+
' AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER'+
' LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,'+
' OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN'+
' THE SOFTWARE.');
    });

    cli.extend('test',function(data,cli){
        cli.nl().write(JSON.stringify(data)).nl();
        console.log(data);
    });

    cli.extend('echo',function(data,cli){
        cli.write(data.parametersText);
    });

    cli.extend('eval',function(data,cli){
        cli.nl().write('evaluating ' + data.parametersText).nl();
        eval(data.parametersText);
    });

    cli.extend('reset',function(data,cli){
        cli.clear();
        cli.init(cli.parent.id);
    });

    cli.extend('trash',function(data,cli){

        var line = '';
        for(var i=0;i<90000;i++){
            var code = Math.random() * 32 + 9472;
            line+=String.fromCharCode(code);
        }
        cli.write(line);


    });

    cli.extend('command_to_test_suggestions',function(){},function(command,cli){
        if(command.parameters.length==1 && command.text.substr(command.text.length-1)!=' ')cli.commandline+=' ';
        console.log(command);
    });

    cli.extend('error',function(){
        undefined_function();
    });

    cli.extend('line',function(data,cli){
        cli.write('-'.repeat(cli.calculateDim()));
    });

    cli.extend('centered',function(data,cli){
        cli.write(' '.repeat((cli.calculateDim()-data.parametersText.length)/2)+data.parametersText);
    });

    cli.addProcessor('reset',function(command,cli){
        if(command.command == 'reset'){
            document.location.reload();
            return true;
        }
    });


})(CLI);
