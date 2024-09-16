CLI.init('cli');

if (localStorage.getItem('old') !== true) {
    CLI.run('motd');
    localnStorage.setItem('old', true);
}

if (localStorage.getItem('old') == true) {
    CLI.run('motdslim');
    localnStorage.setItem('old', true);
}
