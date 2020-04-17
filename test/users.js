/* eslint handle-callback-err: "off"*/
/* eslint camelcase: "off"*/

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'MyUltraSecurePassWordIWontForgetToChange';

const faker = require('faker');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const User = require('../app/models/user');
const UserProperty = require('../app/models/userProperty');
const UserBankAccount = require('../app/models/userBankAccount');
const UserCard = require('../app/models/userCard');
const { Roles, Status } = require('../app/enums');
const helper = require('../helpers/tests');
// eslint-disable-next-line no-unused-vars
const should = chai.should();

let token = '';
let tokenRequester = '';
let providerToken = '';
// eslint-disable-next-line no-unused-vars
let managerToken;
let cpToken = '';
let emailCode = '';
let blockUserId = '';
const email = faker.internet.email();
const title = faker.random.words();
const newName = faker.random.words();
const countryCode = '+92';
const phoneRandom = 1000000000;

const testCategoryId = helper.testId('category');

chai.use(chaiHttp);

/*
 * Test Case Setup for users
 */
const createdID = [];
const adminCredentials = helper.accountCredentials(Roles.Admin);
const requesterCredentials = helper.accountCredentials(Roles.Requester);
const managerCredentials = helper.accountCredentials(Roles.Manager);
const providerCredentials = helper.accountCredentials(Roles.Provider);
const apiName = '/users';
const apiNameUsersSignUp = '/users/signup';
const apiNameUsersLogin = '/users/login';
const userEmail = faker.internet.email();
const userNewEmail = faker.internet.email();
const userProps = {
  first_name: faker.random.words(),
  last_name: faker.random.words(),
  password: '123456',
  role: Roles.Requester
};

const adminUser = {
  first_name: faker.random.words(),
  last_name: faker.random.words(),
  email,
  password: '123456',
  role: Roles.Admin
};

const managerUser = {
  first_name: 'Faraz',
  last_name: 'Hassan',
  email: faker.internet.email(),
  password: '123456',
  role: Roles.Manager
};

const providerUser = {
  otp_token: 'TEST',
  phone_number: `${countryCode}-${faker.random.number(phoneRandom)}`,
  first_name: 'Faraz',
  last_name: 'Hassan',
  email: faker.internet.email(),
  password: '123456',
  role: Roles.Provider,
  categories: [testCategoryId]
};

const requesterUser = {
  otp_token: 'TEST',
  first_name: 'Faraz',
  last_name: 'Hassan',
  phone_number: `${countryCode}-${faker.random.number(phoneRandom)}`,
  email: faker.internet.email(),
  password: '123456',
  role: Roles.Requester
};

const sampleRequesterUser = {
  otp_token: 'TEST',
  first_name: 'Faraz',
  last_name: 'Hassan',
  phone_number: `${countryCode}-${faker.random.number(phoneRandom)}`,
  email: faker.internet.email(),
  password: '123456',
  role: Roles.Requester
};

/*
 * Test Cases for users
 */
describe('*********** USERS ***********', () => {
  describe('/GET /', () => {
    it('it should GET home API url', done => {
      chai
        .request(server)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('/GET /404url', () => {
    it('it should GET 404 url', done => {
      chai
        .request(server)
        .get('/404url')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          done();
        });
    });
  });

  describe('/POST login', () => {
    it('it should GET token', done => {
      chai
        .request(server)
        .post(apiNameUsersLogin)
        .send(adminCredentials)
        .end((err, res) => {
          token = helper.getAuthToken(res);
          done();
        });
    });
  });

  describe('/POST signup', () => {
    it('it should POST signup for admin', done => {
      chai
        .request(server)
        .post(apiNameUsersSignUp)
        .send(adminUser)
        .end((err, res) => {
          helper.getAuthToken(res);
          createdID.push(res.body.data.id);
          done();
        });
    });
    it('it should NOT POST a signup if email already exists', done => {
      chai
        .request(server)
        .post(apiNameUsersSignUp)
        .send(adminUser)
        .end((err, res) => {
          helper.validateConflict(res);
          done();
        });
    });
  });

  describe('/POST signup', () => {
    it('it should POST signup for Manager', done => {
      chai
        .request(server)
        .post(apiNameUsersSignUp)
        .send(managerUser)
        .end((err, res) => {
          helper.getAuthToken(res);
          createdID.push(res.body.data.id);
          blockUserId = res.body.data.id;
          done();
        });
    });
    it('it should NOT POST a signup if email already exists', done => {
      chai
        .request(server)
        .post(apiNameUsersSignUp)
        .send(adminUser)
        .end((err, res) => {
          helper.validateConflict(res);
          done();
        });
    });
  });

  describe('/POST signup', () => {
    it('it should POST signup for Provider', done => {
      chai
        .request(server)
        .post(apiNameUsersSignUp)
        .send(providerUser)
        .end((err, res) => {
          providerToken = helper.getAuthToken(res);
          createdID.push(res.body.data.id);
          done();
        });
    });
    it('it should NOT POST a signup if email already exists', done => {
      chai
        .request(server)
        .post(apiNameUsersSignUp)
        .send(adminUser)
        .end((err, res) => {
          helper.validateConflict(res);
          done();
        });
    });
  });

  describe('/POST signup', () => {
    it(`it should POST signup for Requester${requesterUser.phone_number}`, done => {
      chai
        .request(server)
        .post(apiNameUsersSignUp)
        .send({
          ...requesterUser
        })
        .end((err, res) => {
          helper.getAuthToken(res);
          createdID.push(res.body.data.id);
          done();
        });
    });
    it('it should NOT POST a signup if email already exists', done => {
      chai
        .request(server)
        .post(apiNameUsersSignUp)
        .send(adminUser)
        .end((err, res) => {
          helper.validateConflict(res);
          done();
        });
    });
  });
  describe('/POST login', () => {
    it('it should GET token and user Id', done => {
      chai
        .request(server)
        .post(apiNameUsersLogin)
        .send(requesterCredentials)
        .end((err, res) => {
          tokenRequester = helper.getAuthToken(res);
          done();
        });
    });
  });

  // Test for update profile picture
  describe('/POST update', () => {
    it('it should update admin profile', done => {
      chai
        .request(server)
        .post('/users/update_user')
        .set('Authorization', `Bearer ${tokenRequester}`)
        .send({ profile_picture: 'image.png' })
        .end((err, res) => {
          helper.validateSuccess(res);
          done();
        });
    });
  });

  // Test for forgot password with email
  describe('/POST forgetPasswordEmail', () => {
    it('it should forget user password with email', done => {
      chai
        .request(server)
        .post('/users/forgot_password_by_email')
        .send({ email: 'test@gmail.com', role: Roles.Requester })
        .end((err, res) => {
          helper.validateSuccess(res);
          done();
        });
    });
  });

  // Test for forgot password with phone
  describe('/POST forgetPasswordPhone', () => {
    it('it should forget user password with phone', done => {
      chai
        .request(server)
        .post('/users/forgot_password')
        .send({ phone_number: '+1-3335421471', role: Roles.Requester })
        .end((err, res) => {
          helper.validateSuccess(res);
          done();
        });
    });
  });

  // Test for change password
  describe('/POST change password', () => {
    it('it should POST signup for customer', done => {
      chai
        .request(server)
        .post(apiNameUsersSignUp)
        .send({
          ...sampleRequesterUser
        })
        .end((err, res) => {
          cpToken = helper.getAuthToken(res);
          createdID.push(res.body.data.id);
          done();
        });
    });

    it('it should change user password', done => {
      chai
        .request(server)
        .post('/users/change_password')
        .set('Authorization', `Bearer ${cpToken}`)
        .send({
          old_password: '123456',
          password: 'faraz1234',
          password_status: 'change'
        })
        .end((err, res) => {
          helper.validateSuccess(res);
          done();
        });
    });
    it('it should Login With change password', done => {
      chai
        .request(server)
        .post(apiNameUsersLogin)
        .send({ email: sampleRequesterUser.email, password: 'faraz1234', role: 'customer' })
        .end((err, res) => {
          helper.getAuthToken(res);
          done();
        });
    });
  });

  describe('/POST login', () => {
    it('it should GET token', done => {
      chai
        .request(server)
        .post(apiNameUsersLogin)
        .send(managerCredentials)
        .end((err, res) => {
          managerToken = helper.getAuthToken(res);
          done();
        });
    });
  });

  describe('/POST login', () => {
    it('it should GET token and user Id', done => {
      chai
        .request(server)
        .post(apiNameUsersLogin)
        .send(providerCredentials)
        .end((err, res) => {
          providerToken = helper.getAuthToken(res);
          done();
        });
    });
  });

  // Test for Updating user status
  describe('/POST Terminate/block user account', () => {
    it('it should Terminate/block user account', done => {
      chai
        .request(server)
        .post('/users/update_status')
        .set('Authorization', `Bearer ${token}`)
        .field('user_id', blockUserId)
        .field('role', Roles.Manager)
        .field('status', Status.Blocked)
        .end((err, res) => {
          helper.validateSuccess(res);
          done();
        });
    });
  });

  const phoneNumber = '+92-3335421471';
  let otpCode = '';
  describe('/POST OTP verify', () => {
    it('it should send a code to the provided phone number', done => {
      chai
        .request(server)
        .post('/users/verify_phone')
        .send({
          phone_number: phoneNumber
        })
        .end((err, res) => {
          helper.validateSuccess(res);
          res.body.data.should.have.property('code'); // Only for test env
          otpCode = res.body.data.code;
          done();
        });
    });
    it('it should not verify the wrong otp code', done => {
      chai
        .request(server)
        .post('/users/verify_otp_code')
        .send({
          phone_number: phoneNumber,
          code: '123'
        })
        .end((err, res) => {
          helper.validateUnprocessable(res);
          done();
        });
    });
    it(`it should verify the otp code and return token`, done => {
      chai
        .request(server)
        .post('/users/verify_otp_code')
        .send({
          phone_number: phoneNumber,
          code: otpCode
        })
        .end((err, res) => {
          helper.getOTPToken(res);
          done();
        });
    });
  });

  describe('/GET user', () => {
    it('it should NOT be able to consume the route since no token was sent', done => {
      chai
        .request(server)
        .get(apiName)
        .end((err, res) => {
          helper.validateUnauthorized(res);
          done();
        });
    });
    it('it should GET the users with filters', done => {
      chai
        .request(server)
        .get(`${apiName}?filter=Nauman&fields=first_name`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          helper.validateCollection(res);
          done();
        });
    });
  });

  describe('/POST user', () => {
    it('it should NOT POST a user without required fields', done => {
      chai
        .request(server)
        .post(apiName)
        .set('Authorization', `Bearer ${token}`)
        .send({}) // {} Empty Request Object
        .end((err, res) => {
          helper.validateBadRequest(res, true);
          done();
        });
    });
    it('it should POST a user ', done => {
      const user = {
        email: userEmail,
        phone_number: `${countryCode}-${faker.random.number(phoneRandom)}`,
        ...userProps
      };
      chai
        .request(server)
        .post(apiName)
        .set('Authorization', `Bearer ${token}`)
        .send(user)
        .end((err, res) => {
          helper.validateSuccess(res);
          res.body.data.should.include.keys('id', 'email');
          createdID.push(res.body.data.id);
          done();
        });
    });
  });

  describe('/GET/:id user', () => {
    it('it should GET a user by the given id', done => {
      const id = createdID.slice(-1).pop();
      chai
        .request(server)
        .get(`${apiName}/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .end((error, res) => {
          helper.validateSuccess(res);
          res.body.data.should.have.property('email');
          res.body.data.should.have.property('id').eql(id);
          done();
        });
    });
  });

  describe('/POST Send verification code to email', () => {
    it('it should Send verification code to email', done => {
      chai
        .request(server)
        .post('/users/verify_email')
        .set('Authorization', `Bearer ${cpToken}`)
        .end((error, res) => {
          helper.validateSuccess(res);
          res.body.data.should.have.property('code'); // Only for the test environment
          emailCode = res.body.data.code;
          done();
        });
    });

    it('it should Send verify the email', done => {
      chai
        .request(server)
        .post('/users/verify_email_code')
        .set('Authorization', `Bearer ${cpToken}`)
        .field('verification_code', emailCode)
        .end((error, res) => {
          res.body.should.be.an('object');
          done();
        });
    });
  });

  describe('/POST/:id user', () => {
    it('it should UPDATE a user given the id', done => {
      const id = createdID.slice(-1).pop();
      chai
        .request(server)
        .post(`${apiName}/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: userEmail,
          phone_number: `${countryCode}-${faker.random.number(phoneRandom)}`,
          ...userProps,
          status: Status.Active
        })
        .end((error, res) => {
          helper.validateSuccess(res);
          res.body.data.should.have.property('id').eql(id);
          res.body.data.should.have.property('email').eql(userEmail.toLowerCase());
          done();
        });
    });
  });

  describe('/DELETE/:id user', () => {
    it('it should DELETE a user given the id', done => {
      const user = {
        email: userNewEmail,
        phone_number: `${countryCode}-${faker.random.number(phoneRandom)}`,
        ...userProps
      };
      chai
        .request(server)
        .post(apiName)
        .set('Authorization', `Bearer ${token}`)
        .send(user)
        .end((err, res) => {
          helper.validateSuccess(res);
          res.body.data.should.include.keys('id', 'email');
          res.body.data.should.have.property('email').eql(userNewEmail.toLowerCase());
          chai
            .request(server)
            .delete(`${apiName}/${res.body.data.id}`)
            .set('Authorization', `Bearer ${token}`)
            .end((error, result) => {
              helper.validateSuccess(result);
              done();
            });
        });
    });
  });

  after(() => {
    helper.deleteTestRecords(User, createdID);
  });
});

/*
 * Test Case Setup for user properties
 */
const createdPropertyID = [];
const shouldInclude = ['id', 'name'];
const apiNameUserProperty = '/users/properties';
const userPropertyProps = {
  number_of_rooms: 5,
  built_year: 1992,
  house_size: 200,
  lot_size: 200,
  street: 'abc',
  apartment: 'abc',
  city: 'abc',
  state: 'abc',
  country: 'abc',
  zip_code: 'abc'
};

/*
 * Test Cases for user properties
 */
describe('*********** USERS PROPERTIES ***********', () => {
  describe('/GET user properties', () => {
    it('it should NOT be able to consume the route since no token was sent', done => {
      chai
        .request(server)
        .get(apiNameUserProperty)
        .end((err, res) => {
          helper.validateUnauthorized(res);
          done();
        });
    });
    it('it should GET the user properties with filters', done => {
      chai
        .request(server)
        .get(`${apiNameUserProperty}?filter=MyProperty&fields=name`)
        .set('Authorization', `Bearer ${tokenRequester}`)
        .end((err, res) => {
          helper.validateCollection(res);
          done();
        });
    });
  });

  describe('/POST user', () => {
    it('it should NOT POST a user property without required fields', done => {
      chai
        .request(server)
        .post(apiNameUserProperty)
        .set('Authorization', `Bearer ${tokenRequester}`)
        .send({}) // {} Empty Request Object
        .end((err, res) => {
          helper.validateBadRequest(res, true);
          done();
        });
    });
    it('it should POST a user property', done => {
      const userProperty = {
        name: title,
        ...userPropertyProps
      };
      chai
        .request(server)
        .post(apiNameUserProperty)
        .set('Authorization', `Bearer ${tokenRequester}`)
        .send(userProperty)
        .end((err, res) => {
          helper.validateWithKeys(res, shouldInclude);
          createdPropertyID.push(res.body.data.id);
          done();
        });
    });
  });

  describe('/GET/:id user property', () => {
    it('it should GET a user property by the given id', done => {
      const id = createdPropertyID.slice(-1).pop();
      chai
        .request(server)
        .get(`${apiNameUserProperty}/${id}`)
        .set('Authorization', `Bearer ${tokenRequester}`)
        .end((error, res) => {
          helper.validateWithKeys(res, shouldInclude);
          res.body.data.should.have.property('id').eql(id);
          done();
        });
    });
  });

  describe('/POST/:id user property', () => {
    it('it should UPDATE a user property given the id', done => {
      const id = createdPropertyID.slice(-1).pop();
      chai
        .request(server)
        .post(`${apiNameUserProperty}/${id}`)
        .set('Authorization', `Bearer ${tokenRequester}`)
        .send({
          name: newName,
          ...userPropertyProps
        })
        .end((error, res) => {
          helper.validateWithKeys(res, shouldInclude);
          res.body.data.should.have.property('id').eql(id);
          res.body.data.should.have.property('name').eql(newName);
          done();
        });
    });
  });

  describe('/DELETE/:id user property', () => {
    it('it should DELETE a user property given the id', done => {
      const userProperty = {
        name: title,
        ...userPropertyProps
      };
      chai
        .request(server)
        .post(apiNameUserProperty)
        .set('Authorization', `Bearer ${tokenRequester}`)
        .send(userProperty)
        .end((err, res) => {
          helper.validateWithKeys(res, shouldInclude);
          res.body.data.should.have.property('name').eql(title);
          chai
            .request(server)
            .delete(`${apiNameUserProperty}/${res.body.data.id}`)
            .set('Authorization', `Bearer ${tokenRequester}`)
            .end((error, result) => {
              helper.validateSuccess(result);
              done();
            });
        });
    });
  });

  after(() => {
    helper.deleteTestRecords(UserProperty, createdPropertyID);
  });
});

/*
 * Test Case Setup for user cards
 */
const createdCardID = [];
const shouldIncludeCards = ['id'];
const apiNameUserCard = '/users/cards';
const userCardProps = {
  stripe_card_token: 'tok_vhjfth1231vbn312tyut',
  is_default: true
};

/*
 * Test Cases for user cards
 */
describe('*********** USERS CARDS ***********', () => {
  describe('/GET user cards', () => {
    it('it should NOT be able to consume the route since no token was sent', done => {
      chai
        .request(server)
        .get(apiNameUserCard)
        .end((err, res) => {
          helper.validateUnauthorized(res);
          done();
        });
    });
    it('it should GET all the user cards', done => {
      chai
        .request(server)
        .get(apiNameUserCard)
        .set('Authorization', `Bearer ${tokenRequester}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('data');
          res.body.data.should.be.a('array');
          done();
        });
    });
  });

  describe('/POST user card', () => {
    it('it should NOT POST a user card without required fields', done => {
      chai
        .request(server)
        .post(apiNameUserCard)
        .set('Authorization', `Bearer ${tokenRequester}`)
        .send({}) // {} Empty Request Object
        .end((err, res) => {
          helper.validateBadRequest(res, true);
          done();
        });
    });
    it('it should POST a user card', done => {
      const userCard = {
        ...userCardProps
      };
      chai
        .request(server)
        .post(apiNameUserCard)
        .set('Authorization', `Bearer ${tokenRequester}`)
        .send(userCard)
        .end((err, res) => {
          helper.validateWithKeys(res, shouldIncludeCards);
          createdCardID.push(res.body.data.id);
          done();
        });
    });
  });

  describe('/GET/:id user card', () => {
    it('it should GET a user card by the given id', done => {
      const id = createdCardID.slice(-1).pop();
      chai
        .request(server)
        .get(`${apiNameUserCard}/${id}`)
        .set('Authorization', `Bearer ${tokenRequester}`)
        .end((error, res) => {
          helper.validateWithKeys(res, shouldIncludeCards);
          res.body.data.should.have.property('id').eql(id);
          done();
        });
    });
  });

  describe('/POST/:id user card', () => {
    it('it should UPDATE a user card given the id', done => {
      const id = createdCardID.slice(-1).pop();
      chai
        .request(server)
        .post(`${apiNameUserCard}/${id}`)
        .set('Authorization', `Bearer ${tokenRequester}`)
        .send({
          is_default: true
        })
        .end((error, res) => {
          helper.validateWithKeys(res, shouldIncludeCards);
          res.body.data.should.have.property('id').eql(id);
          done();
        });
    });
  });

  describe('/DELETE/:id user card', () => {
    it('it should DELETE a user card given the id', done => {
      const userCard = {
        ...userCardProps
      };
      chai
        .request(server)
        .post(apiNameUserCard)
        .set('Authorization', `Bearer ${tokenRequester}`)
        .send(userCard)
        .end((err, res) => {
          helper.validateWithKeys(res, shouldIncludeCards);
          chai
            .request(server)
            .delete(`${apiNameUserCard}/${res.body.data.id}`)
            .set('Authorization', `Bearer ${tokenRequester}`)
            .end((error, result) => {
              helper.validateSuccess(result);
              done();
            });
        });
    });
  });

  after(() => {
    helper.deleteTestRecords(UserCard, createdCardID);
  });
});

/*
 * Test Case Setup for user bank accounts
 */
const createdBankAccountID = [];
const shouldIncludeBankAccounts = ['id'];
const apiNameUserBankAccount = '/users/bank_details';
const userBankAccountProps = {
  stripe_bank_account_token: 'Btok_we3werwew34324'
};

/*
 * Test Cases for user bank accounts
 */
describe('*********** USERS BANK ACCOUNTS ***********', () => {
  describe('/GET user bank accounts', () => {
    it('it should NOT be able to consume the route since no token was sent', done => {
      chai
        .request(server)
        .get(apiNameUserBankAccount)
        .end((err, res) => {
          helper.validateUnauthorized(res);
          done();
        });
    });
    it('it should GET all the user bank accounts', done => {
      chai
        .request(server)
        .get(apiNameUserBankAccount)
        .set('Authorization', `Bearer ${providerToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('data');
          res.body.data.should.be.a('array');
          done();
        });
    });
  });

  describe('/POST user bankAccount', () => {
    it('it should NOT POST a user bankAccount without required fields', done => {
      chai
        .request(server)
        .post(apiNameUserBankAccount)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({}) // {} Empty Request Object
        .end((err, res) => {
          helper.validateBadRequest(res, true);
          done();
        });
    });
    it('it should POST a user bankAccount', done => {
      const userBankAccount = {
        ...userBankAccountProps
      };
      chai
        .request(server)
        .post(apiNameUserBankAccount)
        .set('Authorization', `Bearer ${providerToken}`)
        .send(userBankAccount)
        .end((err, res) => {
          helper.validateWithKeys(res, shouldIncludeBankAccounts);
          createdBankAccountID.push(res.body.data.id);
          done();
        });
    });
  });

  describe('/GET/:id user bankAccount', () => {
    it('it should GET a user bankAccount by the given id', done => {
      const id = createdBankAccountID.slice(-1).pop();
      chai
        .request(server)
        .get(`${apiNameUserBankAccount}/${id}`)
        .set('Authorization', `Bearer ${providerToken}`)
        .end((error, res) => {
          helper.validateWithKeys(res, shouldIncludeBankAccounts);
          res.body.data.should.have.property('id').eql(id);
          done();
        });
    });
  });

  describe('/POST/:id user bankAccount', () => {
    it('it should UPDATE a user bankAccount given the id', done => {
      const id = createdBankAccountID.slice(-1).pop();
      chai
        .request(server)
        .post(`${apiNameUserBankAccount}/${id}`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          is_default: true
        })
        .end((error, res) => {
          helper.validateWithKeys(res, shouldIncludeBankAccounts);
          res.body.data.should.have.property('id').eql(id);
          done();
        });
    });
  });

  describe('/DELETE/:id user bankAccount', () => {
    it('it should DELETE a user bankAccount given the id', done => {
      const userBankAccount = {
        ...userBankAccountProps
      };
      chai
        .request(server)
        .post(apiNameUserBankAccount)
        .set('Authorization', `Bearer ${providerToken}`)
        .send(userBankAccount)
        .end((err, res) => {
          helper.validateWithKeys(res, shouldIncludeBankAccounts);
          chai
            .request(server)
            .delete(`${apiNameUserBankAccount}/${res.body.data.id}`)
            .set('Authorization', `Bearer ${providerToken}`)
            .end((error, result) => {
              helper.validateSuccess(result);
              done();
            });
        });
    });
  });

  after(() => {
    helper.deleteTestRecords(UserBankAccount, createdBankAccountID);
  });
});
