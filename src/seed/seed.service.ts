import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';


@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ){}

  async runSeed(){
    await this.deleteTables()
    const adminUser = await this.insertUsers()
    await this.insertNewProducts(adminUser)
    return "Seed executed"
  }

  private async deleteTables(){
    await this.productsService.deleteAllProducts()
    const queryBuilder = this.userRepo.createQueryBuilder()

    await queryBuilder
    .delete()
    .where({})
    .execute()
  }

  private async insertUsers(){
    const seedUsers = initialData.users

    const users: User[] = []
    
    seedUsers.forEach(user => {
      users.push(this.userRepo.create(user))
    })

    const dbUsers = await this.userRepo.save(seedUsers)
    return dbUsers[0]
  }

  private async insertNewProducts(user: User){
    await this.productsService.deleteAllProducts()

    const products = initialData.products

    const insertPromises = []
    products.forEach( product => {
      insertPromises.push(this.productsService.create(product, user))
    })

    const results = await Promise.all(insertPromises)

    return results

  }
}
