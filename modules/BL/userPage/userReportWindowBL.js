const DAL = require('../../DAL');
const config = require('../../../config');
const enums = require('../../enums');
const sha512 = require('js-sha512');

const usersCollectionName = config.db.collections.users;
const ReportReasonsCollectionName = config.db.collections.reportReasons;

module.exports = {
    GetAllReportReasons() {
        return new Promise((resolve, reject) => {
            DAL.Find(ReportReasonsCollectionName, {}).then(resolve).catch(reject);
        });        
    }
}