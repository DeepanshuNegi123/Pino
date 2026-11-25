variable "aws_region" {

   default = "ap-south-1"


}


variable "instance_type" {

   default = "t3.micro"

}


variable "ami_id" {

   default = "ami-083cf4acad89c8905"


}

variable "key_name" {

   default = "aws-key-pair"

}

variable "my_ip" {

   description = "this is my public ip"
   default = "125.62.127.247"
   type = string
  
}
