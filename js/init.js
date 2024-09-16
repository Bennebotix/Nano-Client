CLI.init('cli');

if (localStorage.getItem('old') !== true) {
    CLI.run('motd');
    localnStorage.setItem('old', true);
} else {
    CLI.run('motdslim');
    alert('yay');
    localnStorage.setItem('old', true);
}
