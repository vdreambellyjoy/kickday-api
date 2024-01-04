const { kickDay1 } = require('./Controller/scriptController');

const kickDayScripts = {

    executekickDayScripts1_0: async (value,db) => {

        //Script:- 1 PK
        value && console.log("kickDay1.0-->Script-1");
        value && await kickDay1.updateQuantityAsNumber(db);
    }
};

module.exports = kickDayScripts;