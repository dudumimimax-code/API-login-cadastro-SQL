const { Model, DataTypes } = require('sequelize');

class Product extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: { type: DataTypes.STRING(120), allowNull: false },
        category: { type: DataTypes.STRING(80), allowNull: false },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
      },
      {
        sequelize,
        modelName: 'Product',
        tableName: 'products',
      }
    );
  }

  static associate(models) {
    // Um produto pertence a um único usuário (Many-to-One)
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'owner' });
  }
}

module.exports = Product;
