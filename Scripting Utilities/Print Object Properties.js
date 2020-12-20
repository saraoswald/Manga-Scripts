function help(obj) {
    var str = obj.properties ? obj.properties.toSource() : obj.toSource();
    var props = str.substr(2, str.length - 4).split(', ');
    for (var i = 0; i < props.length; i++) {
        $.writeln(props[i]);
    }
}