import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsInt,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { SortOptionEnum } from 'src/configs/constants/common';
import { Visibility } from 'src/entities';

export class CreateArticleDTO {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  visibility: string;

  @IsArray()
  @IsNotEmpty()
  topics: number[];
}

export class UpdateArticleDTO {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;
}

export class SearchArticleDTO {
  @IsString()
  @IsOptional()
  textSearch: string;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  page: number;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  perPage: number;

  @IsArray()
  @IsOptional()
  topicUrls: string[];

  @IsString()
  @IsOptional()
  @IsEnum(SortOptionEnum)
  sortByDate: 'ASC' | 'DESC';
}
export class SearchArticleForAdminDTO {
  @IsString()
  @IsOptional()
  textSearch: string;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  page: number;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  perPage: number;

  @IsArray()
  @IsOptional()
  topicUrls: string[];

  @IsString()
  @IsOptional()
  @IsEnum(SortOptionEnum)
  sortByDate: 'ASC' | 'DESC';

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  deleteSoft: boolean;

  @IsArray()
  @IsOptional()
  @IsEnum(Visibility, { each: true })
  visibilities: string[];
}
