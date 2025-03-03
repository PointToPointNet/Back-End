const LogModuleRunner = require("./log_manager/LogModuleRunner");
const InsertStatistics = require("./InsertStatistics");
const runner = new LogModuleRunner();
const insertStatistics = new InsertStatistics();
runner.run();
insertStatistics.start();