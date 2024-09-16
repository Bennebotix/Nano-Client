CLI.init('cli');

if (localStorage.getItem('old') !== true) {
    CLI.run('motd');
    localnStorage.setItem('old', true);
} else {
    CLI.run('motdslim');
    localnStorage.setItem('old', true);
}
