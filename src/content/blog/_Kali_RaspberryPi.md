---
By default, if a file name starts with _ that file is notincludedin collection !
---

## Raspberry Pi 4

### Download and check the image

As per [Raspberry Pi 4](https://www.kali.org/docs/arm/raspberry-pi-4/) page from the official [Kali On Arm](https://www.kali.org/docs/arm/), the recommended image is the 32-bit one.

From the [Download Kali Linux](https://www.kali.org/get-kali/#kali-platforms) page download the **Kali Linux RaspberryPi 2,3,4 and 400 (32-bit)** image. The current file was `kali-linux-2024.1-raspberry-pi-armhf.img.xz`.

There is no `SHA256SUMS.gpg` so the only way to verify the image is to take note of the SHA256 from the download page check the downloaded image:

```sh
echo '1a17a334e5c2b5bdef76f84f8b51aa732ae4c77e50c4621cb7a3cd10dd148f51 kali-linux-2024.1-raspberry-pi-armhf.img.xz' | sha256sum -c
```

should return `kali-linux-2024.1-raspberry-pi-armhf.img.xz: OK`

### Write the image

Insert the SD card and check it's device name, was `mmcblk0` in my case, and replace `mmcblkX` with correct value in the following command to write the image to the SD card:

**Warning**: make sure you use the right device name or you may overwrite your disk !

```sh
xzcat kali-linux-2024.1-raspberry-pi-armhf.img.xz | sudo dd of=/dev/mmcblkX bs=4M status=progress
```

## First config

In the BOOT partition:

```sh
# Allow boot without HDMI connected
sed -i '/hdmi_force_hotplug/s/^#//g' config.txt

# Set WPA credentials. Generate the file with:
# wpa_passphrase YOURNETWORK > wpa_supplicant.conf
# cat << EOF > wpa_supplicant.conf
# network={
#     ssid="A2"
#     psk=a7d7e6bab4ba6f8cb27db86fd6766dca117485553362040cdc8d9ee1da1fd7f2
# }
# EOF

# Enable SSH server
touch ssh
```

see RaspberryPi_init.sh
see create_AP.sh


## Backup

ls -l /dev/mmcblk*
sudo dd bs=4M if=/dev/mmcblk0 | gzip > /home/calin/rpiKali-`date +%Y%m%d`.gz
sudo gzip -dc /home/calin/rpiKali.gz | sudo dd bs=4M status=progress of=/dev/mmcblkX
