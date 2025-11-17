/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inquery } from './schemes/inquery.schema';
import { CreateInqueryInput } from './dto/create-inquery.input';
import * as nodemailer from 'nodemailer';

@Injectable()
export class InqueryService {
  constructor(
    @InjectModel(Inquery.name) private inqueryModel: Model<Inquery>,
  ) {}

  async create(input: CreateInqueryInput) {
    try {
      const result = await this.inqueryModel.create(input);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER,
        subject: `New Inquiry from ${input.name}`,
        text: `Name: ${input.name}\nEmail: ${input.email}\nPhone: ${input.phone}\nDetail: ${input.detail}\nAgreed: ${input.agreed}`,
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await transporter.sendMail(mailOptions);

      return result;
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException(err.message);
    }
  }

  async findAll() {
    return this.inqueryModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const result = await this.inqueryModel.findById(id);
    if (!result) {
      throw new BadRequestException('Inquiry not found');
    }
    return result;
  }
}
