import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { isValidObjectId, Model, plugin } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import e from 'express';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  private readonly defaultLimit: number;
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = configService.get<number>('default_limit');
    console.log(this.defaultLimit); // es como quedo en el archivo de configuración no como esta en el .env
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 10 } = paginationDto;
    // Se esta organizando por la columna "no" de manera ascedente
    return (
      this.pokemonModel
        .find()
        .limit(limit)
        .skip(offset)
        .sort({ no: 1 })
        // El select con el signo "-" dice que vamos a eliminar del resultado una columna, en este caso la columna "__v"
        .select('-__v')
    );
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({
        name: term.toLowerCase().trim(),
      });
    }

    if (!pokemon)
      throw new NotFoundException(
        `Pokemon with id, name or no "${term}" not found `,
      );
    return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    await this.findOne(id);

    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }

    try {
      return await this.pokemonModel.updateOne(updatePokemonDto);
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0) {
      throw new NotFoundException(`Pokemon with id: "${id}" not found`);
    }
    return;
  }

  async insertMany(pokemons: CreatePokemonDto[]) {
    await this.pokemonModel.insertMany(pokemons);
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new ConflictException(
        `Pokemon already exists in the db ${JSON.stringify(error.keyValue)}`,
      );
    }
    console.error(error);
    throw new InternalServerErrorException(
      'Can perform operation, see the logs',
    );
  }
}
