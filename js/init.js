CLI.init('cli');

if(CLI.commands.motd != undefined && !sessionStorage.getItem('old')) {
    CLI.run('motd');
    sessionStorage.setItem('old', true);
}
