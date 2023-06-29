import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { SortOptionEnum } from 'src/configs/constants/common';

export class SearchTopicDTO {
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  perPage?: number;

  @IsArray()
  @IsOptional()
  topicIds?: number[];

  @IsString()
  @IsOptional()
  @IsEnum(SortOptionEnum)
  sortByPriority?: 'ASC' | 'DESC';
}

export class CreateTopicDTO {
  @IsString()
  name: string;

  @IsInt()
  @IsOptional()
  priority: number;
}

export class UpdateTopicDTO {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  priority: number;
}
