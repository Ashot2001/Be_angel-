import { Model } from "objection";
import knex from 'knex';
import { ErrorsUtil } from '../utils'

const { InputValidationError, ResourceNotFoundError } = ErrorsUtil;

import knexConfigs from '../../knex.configs';

const pg = knex(knexConfigs.development);

class BenevolentModel extends Model {
  static get idColumn() {
    return "id";
  }

  static get tableName() {
    return "benevolents";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: [],
      properties: {
        id: { type: "integer" },
      },
    };
  }

  $beforeInsert() {
    const date = new Date();
    this.created_at = date;
  }
  $beforeUpdate() {
    const date = new Date();
    this.updated_at = date;
  }
  static async buyGift(data) {
    const result = await BenevolentModel.query().findOne({ child_id: data.child_id });
    const dream = await pg('dreams').where('id', '=', data.child_id).first();
    console.log(dream,'drrrrrrrrrr');
    if (!result && dream) {
      const updatedData = await pg('dreams').update({ is_active: true }).where('id', '=', data.child_id);
      return BenevolentModel.query().insert(data).returning("*");
    } else if (!dream) {
      throw new InputValidationError('The dream is not found');
    } else {
      throw new InputValidationError('The dream has already been taken');
    }
  }


  static async takeLetter(data) {
    const result = await BenevolentModel.query().findOne({ child_id: data.child_id });
    const dream = await pg('dreams').where('id', '=', data.child_id).first();

    if (!result && dream) {
      const updatedData = await pg('dreams').update({ is_active: true }).where('id', '=', data.child_id);
      return BenevolentModel.query().insert(data).returning("*");
    } else if (!dream) {
      throw new InputValidationError('The dream is not found');
    } else {
      throw new InputValidationError('The dream has already been taken');
    }
  }


  static getBenevolent(child_id) {
    return BenevolentModel.query().select('*').where('child_id', '=', child_id).returning('*');
  }


  static async delGift(id, child_id) {
    // Update 'is_active' field in the database
    const updateResult = await pg('dreams')
      .where('id', '=', child_id)
      .update({ is_active: false });
  
    // Check if the update was successful (number of affected rows greater than 0)
    if (updateResult > 0) {
      // Fetch the updated data based on 'id'
      const updatedData = await BenevolentModel.query()
        .select('*')
        .where('id', '=', id)
        .del()
  
      return updatedData;
    } else {
      // Handle the case where the update was not successful (e.g., child_id not found)
      return null;
    }
  }
  


}

export default BenevolentModel;