const { Model, DataTypes } = require('sequelize');

class User extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: { type: DataTypes.STRING(120), allowNull: false },
        email: { type: DataTypes.STRING(160), allowNull: false, unique: true },
        password: { type: DataTypes.STRING(255), allowNull: false },
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        // A senha nunca é carregada por padrão; só com o escopo "withPassword".
        defaultScope: { attributes: { exclude: ['password'] } },
        scopes: { withPassword: { attributes: { include: ['password'] } } },
      }
    );
  }

  static associate(models) {
    // Um usuário possui vários produtos (One-to-Many)
    this.hasMany(models.Product, { foreignKey: 'user_id', as: 'products' });
  }

  // Garantia extra: mesmo se a senha for carregada, não sai no JSON.
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}

module.exports = User;
