provider "aws" {

  region = var.aws_region

}


resource "aws_instance" "web_server"{

ami = var.ami_id
instance_type = var.instance_type
key_name = var.key_name
vpc_security_group_ids = [aws_security_group.connection.id]




tags = {

 name = "first_instance"

}

}

output "public_ip" {

  value = aws_instance.web_server.public_ip


}
