/* user  details */

/*
    The events endpoint supports the following operations -
        - validateLogin
        - getUser
        - createUser

      

    The user service supports the following APIs.
    The API params are present in the incoming req body.
    The op argument is a mnemonic which is self-explanatory WRT the operation
    The status and errCode are considered together when the operation fails
    The status and the result are considered together when the operation succeeds

   
    {op: 'validateLogin', email: <string>,password:<string>}
        Returns {status: true, result: <user>,statusCode: 200} if a user is successfully fetched
        Returns {status: false, errCode: 'user.validate_login:invalid-email',statusCode: 400} if invalid email provided
        Returns {status: false, errCode: 'user.validate_login:invalid-password',statusCode: 400} if invalid password provided
        Returns {status: false, errCode: 'user.validate_login:exception-failure',statusCode: 500} if user fetch fails due to exception errors
 
    {op: 'getUser', email: <string>,mobile:<string>}
        and authorization token is passed in the header {authorization: 'Bearer <token>'}

        Returns {status: true, result: <user>,statusCode: 200} if a user is successfully fetched
        Returns {status: false, errCode: 'user.get_user:invalid-email',statusCode: 400} if invalid email provided
        Returns {status: false, errCode: 'user.get_user:invalid-mobile',statusCode: 400} if invalid phone provided
        Returns {status: false, errCode: 'user.get_user:exception-failure',statusCode: 500} if user fetch fails due to exception errors
 
    {op: 'createUser', email: <string>,mobile:<string>,password:<string>}
        Returns {status: true, result: <user>,statusCode: 200} if a user is successfully created
        Returns {status: false, errCode: 'user.set_user:invalid-username',statusCode: 400} if invalid username provided
        Returns {status: false, errCode: 'user.set_user:invalid-email',statusCode: 400} if invalid email provided
        Returns {status: false, errCode: 'user.set_user:invalid-mobile',statusCode: 400} if invalid phone provided
        Returns {status: false, errCode: 'user.set_user:invalid-password',statusCode: 400} if invalid password provided
        Returns {status: false, errCode: 'user.set_user:exception-failure',statusCode: 500} if user fetch fails due to exception errors
      Note : 
      Mandatory - email, password, password
    */
    import validator from "validate.js";
    import regExConstants from "../utils/regExConstants.js";
    import { getUser, validateLogin, setUser } from "../data-manager/users-data-method.js";
    let codeMsg = "aca";
    let opCodesErr = {
      getAca: codeMsg + ":get_details",
      setAca: codeMsg + ":set_details"
    };
      let loginValidator = {
        email: { presence: { allowEmpty: false }, type: "string", format: regExConstants.email },
        password: { presence: { allowEmpty: false }, type: "string", format: regExConstants.password }

      };
      
      let getUserValidator = {
        email: { presence: false, type: "string", format: regExConstants.email },
        mobile: { presence: false, type: "string" },
      }

      let setUserValidator = {
        op: { presence: { allowEmpty: false }, type: "string" },  // Ensure 'op' is present and is a string
        mobile: { 
            presence: { allowEmpty: false },
            type: "string"
        },
        email: {           
        presence: { allowEmpty: false },
        type: "string", format: regExConstants.email 
      },
        username: { 
          presence: { allowEmpty: false },
          type: "string",
          format: regExConstants.username  
        },
        password: { 
          presence: { allowEmpty: false },
          type: "string",
          format: regExConstants.password 
        }
      };
      const check = async a => {
        // all generic control knobs initialized with default values
        // the generic argument needs 4 members - proceed, an argument which is the name of the function
        // (in this function, it is check), the status code and the errCode
        // do not allow any unknown opcode to pass through
        a.proceed = true;
        a.check = true;
        a.errCode = "";
        a.status = true;
        a.statusCode = 200;
        let { op } = a.$$;
      
        /* check if valid opcode provided else return error*/
        if (!["validateLogin", "getUser", "createUser",].includes(a.$$.op)) {
          a.status = a.proceed = a.check = false;
          a.errCode = codeMsg + ":invalid-opcode";
          a.statusCode = 400;
          return a;
        }
      let entityValidator = null;
        if (op === "validateLogin" || op === "getUser" || op === "createUser") {
          if (op === "validateLogin") entityValidator = loginValidator;
          if (op === "getUser") entityValidator = getUserValidator
          if (op === "createUser") entityValidator = setUserValidator

          console.log("entityValidator", entityValidator)
          let isValid = validator(a.$$, entityValidator);

          a.status = a.proceed = a.check = isValid ? false : true;
          if (isValid) {
            a.errCode = opCodesErr[a.$$.op] + ":" + "invalid-" + Object.keys(isValid)[0];
            a.statusCode = 400;
            return a;
          }
        }
        return a;
      };
      
      const validate = async a => {
        if (!a.proceed) return a;
        let { op } = a.$$
        let c = {};
      
        if (op === "validateLogin") {
            c = await validateLogin(a.$$);
            console.log('c',c)
            a.$$.verify = "email"
          a.result = c.status ? c.result : [];
          a.statusCode = c.statusCode;
          a.status = a.validate = a.proceed = c.status;
          a.errCode = !c.status ? c.errCode : "";
        }
        if (op === "getUser" || op === "createUser") {
          let { email, mobile } = a.$$;
          let query = {}
          if (email) query.email = { $regex: new RegExp('^' + a.$$.email + '$', 'i') }
          if (mobile) query.mobile = mobile
          c = await getUser(query);
          if (op === "createUser" && c.status) {
            a.statusCode = 400;
            a.status = a.validate = a.proceed = false;
            a.errCode = codeMsg + `.process:${a.$$.op}-fail;user-already-exists`;
          }
          else if (op === "getUser") {
            a.result = c.status ? c.result : [];
            a.statusCode = c.statusCode;
            a.status = a.validate = a.proceed = c.status;
            a.errCode = !c.status ? codeMsg + `.process:${a.$$.op}-fail;non-existent-user` : "";
          }
        }
        console.log("validateLogin", c, a)

        return a;
      };
      
      const transact = async a => {
        // if the previous method has failed, just quit
        if (!a.proceed) return a;
        let { op } = a.$$;
        let c = {};
      console.log('a',a)
        // for each operation, call respective data-method with the appropriate data
        if (op === 'validateLogin' || op === 'getUser') return a;
        if (op === 'createUser') {
          let { email, username, password, mobile } = a.$$;
          let o = {
            email, username, mobile, password
          }

          if (a.$$.password) o.password = password
          c = await setUser(o)
      
        }
      
        a.status = a.proceed = c.status;
        a.errCode = !c.status ? c.errCode : "";
        a.statusCode = c.statusCode;
        a.transact = c.status;
        a.result = c.result;
        console.log('a',a)
        return a;
      };
      
      let _users = {};
      _users.process = async cmd => {
        return await transact(await validate(await check(cmd)));
      };
      
      
      const users_service = async (req, res) => {
        let users = Object.create(_users);
        let tmp = {};
        tmp.$$ = {};
        // get the req.body
        Object.assign(tmp.$$, req.body);
        // extract the op - just to get a shortcut
        tmp.op = req.body.op;
        // formulate a default error code
        let defaultErrCode = `users:${req.body.op}-process-failure`;
        // create a result object by calling the sms_admin.process method
        // the process sub-methods (check, validate & transact) invoke the data-methods.
        try {
          let y = await users.process(tmp);
          let statusCode = y.statusCode || 500;

          // if success, send status = 200 along with result
          if (y.proceed) {
            res.status(statusCode).json({
              status: true,
              result: y.result
            });
          }
          // if not, send status = 400 along with error code
          else
            res.status(statusCode).json({
              status: false,
              errCode: y.errCode
            });
        } catch (e) {
            console.log('error =',e)
          res.status(424).send({ status: false, errCode: defaultErrCode });
        }
      };
      
      export default { users_service, _users };
      