CLI.init('cli');

if (CLI.commands.motd != undefined && !localStorage.getItem('old')) {
    CLI.run('motd');
    localnStorage.setItem('old', true);
} else {
    CLI.run('motdslim');
}
