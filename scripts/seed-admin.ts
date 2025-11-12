import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  // Create admin user
  const adminEmail = 'admin@keico.com';
  const adminPassword = 'admin123';
  const adminName = 'Admin User';

  try {
    // Check if admin exists
    const { userModel } = authService as any;
    const existingAdmin = await userModel.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      // Update to admin role
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('Admin role updated');
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await userModel.create({
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'admin',
      });
      console.log('Admin user created successfully!');
      console.log('Email:', adminEmail);
      console.log('Password:', adminPassword);
    }
  } catch (error) {
    console.error('Error creating admin:', error);
  }

  await app.close();
}

bootstrap();

