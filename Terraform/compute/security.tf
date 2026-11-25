resource "aws_security_group" "connection" {

  name        = "nagios-sg"
  description = "Security group for Nagios EC2"

  # SSH - only your IP
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["${var.my_ip}/32"]
  }

  # HTTP - Nagios Web UI
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # NRPE - Nagios monitoring port
  ingress {
    from_port   = 5666
    to_port     = 5666
    protocol    = "tcp"
    cidr_blocks = ["${var.my_ip}/32"]
  }

  # Outbound - allow all (needed for apt install)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "nagios-sg"
  }

}