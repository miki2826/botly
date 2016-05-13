module.exports = function (grunt, options) {

    var tasks = ["jshint", "env", "instrument", "mochaTest", "storeCoverage", "makeReport"];
    return {
        "tasks": ["availabletasks"],
        "default": tasks,
        "test": [
            "env", "instrument", "mochaTest", "storeCoverage", "makeReport"
        ]
    };
};
