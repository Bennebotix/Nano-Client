CLI.init('cli');

if(cli.commands.motd != undefined && !sessionStorage.getItem('old')) {
    cli.run('motd');
    sessionStorage.setItem('old', true);
}
