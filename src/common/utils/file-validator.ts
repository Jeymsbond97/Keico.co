import { BadRequestException } from '@nestjs/common';

export const validateImageFile = (
  filename: string,
  maxSizeMB: number = 20,
): void => {
  const allowedExtensions = ['jpg', 'jpeg', 'png'];
  const fileExtension = filename.toLowerCase().split('.').pop();

  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    throw new BadRequestException(
      `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`,
    );
  }
};
