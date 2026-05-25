import { IsEnum, IsOptional, IsString } from "class-validator";


export class UpdateUserDto {

  @IsOptional()
  @IsString()
  name?: string;
 
  @IsOptional()
  @IsString()
  avatarUrl?: string;
  
  @IsOptional()
  @IsEnum(["user", "admin"])
  role?: string;

}