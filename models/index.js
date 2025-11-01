const Item = require('./Item');
const List = require('./List');
const User = require('./User');
const Role = require('./Role');

// 👤 User has many Lists
User.hasMany(List, { foreignKey: 'userId', as: 'lists', onDelete: 'CASCADE' });
List.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 📋 List has many Items
List.hasMany(Item, { foreignKey: 'listId', as: 'items', onDelete: 'CASCADE' });
Item.belongsTo(List, { foreignKey: 'listId', as: 'list' });

// 🎭 User ↔️ Role (N:N)
User.belongsToMany(Role, { through: 'UserRoles', as: 'roles' });
Role.belongsToMany(User, { through: 'UserRoles', as: 'users' });

module.exports = {
    Item,
    List,
    User,
};