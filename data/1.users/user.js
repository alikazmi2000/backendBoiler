const faker = require('faker');
const { Status, Roles } = require('../../app/enums');
const { to24DigitObjectId, leadingObjectId } = require('../../helpers/mocks');
const ObjectID = require('mongodb').ObjectID;
const items = [
  {
    _id: new ObjectID(to24DigitObjectId(leadingObjectId.user, 0)),
    firstName: 'Nauman',
    lastName: 'Admin',
    email: 'test@gmail.com',
    password: '$2a$05$ZrJ7kt//B1lGEqvt8hk8qePL5ZdcyrUsZ6egzpKyDUgZvKpvGmr7.',
    role: Roles.Admin,
    status: Status.Active,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    _id: new ObjectID(to24DigitObjectId(leadingObjectId.user, 1)),
    firstName: 'Nauman',
    lastName: 'Requester',
    countryCode: '+1',
    phoneNumber: '3335421471',
    email: 'test@gmail.com',
    isEmailVerified: true,
    password: '$2a$05$ZrJ7kt//B1lGEqvt8hk8qePL5ZdcyrUsZ6egzpKyDUgZvKpvGmr7.',
    role: Roles.Requester,
    stripeCustomerId: 'cus_G8iwRvF1lr9v7C',
    status: Status.Active,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    _id: new ObjectID(to24DigitObjectId(leadingObjectId.user, 2)),
    firstName: 'Nauman',
    lastName: 'Manager',
    countryCode: '+1',
    phoneNumber: '3335421473',
    email: 'test@gmail.com',
    isEmailVerified: true,
    password: '$2a$05$ZrJ7kt//B1lGEqvt8hk8qePL5ZdcyrUsZ6egzpKyDUgZvKpvGmr7.',
    role: Roles.Manager,
    serviceAreas: [new ObjectID(to24DigitObjectId(leadingObjectId.serviceArea, 0))],
    status: Status.Active,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    _id: new ObjectID(to24DigitObjectId(leadingObjectId.user, 3)),
    firstName: 'Nauman',
    lastName: 'Provider',
    countryCode: '+1',
    phoneNumber: '3335421472',
    email: 'test@gmail.com',
    isEmailVerified: true,
    password: '$2a$05$ZrJ7kt//B1lGEqvt8hk8qePL5ZdcyrUsZ6egzpKyDUgZvKpvGmr7.',
    role: Roles.Provider,
    serviceAreas: [new ObjectID(to24DigitObjectId(leadingObjectId.serviceArea, 0))],
    stripeCustomerId: 'cus_G8iaQfVpDj1U8j',
    status: Status.Active,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  }
];

module.exports = items;
