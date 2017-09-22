#!/usr/bin/perl

#::: Chris Miles - Utility script

use POSIX qw(strftime);

my $output_format = 'human';
my $opt_keep = 'active';

$n = 0;
while ($ARGV[$n]) {
    local $_ = $ARGV[$n];
    $val = $ARGV[$n + 1];

    ($_ eq '--oui-fetch') && do {
        fetch_oui_file();
        exit;
    };
    ($_ eq '--oui-parse') && do {
        parse_oui_file();
        exit;
    };
    ($_ eq '--leases-file') && do { $leases_file = $val; };
    ($_ eq '--parse') && do { $output_format = ''; };

    $n++;
}

do_read();


sub clean_mac($) {
    my $string = shift;
    $string =~ s|:||g;
    $string =~ s/^\s+//;
    $string =~ s/\s+$//;
    return $string;
}

sub trim($) {
    my $string = shift;
    $string =~ s/^\s+//;
    $string =~ s/\s+$//;
    return $string;
}

sub get_lease_value($){
    my $string = shift;

    my @split = split("=", $string);
    $string = trim($split[1]);
    $string =~ s/"//g;
    $string =~ s/;//g;
    $string =~ s/^\s+//;
    $string =~ s/\s+$//;
    return $string;
}

sub fetch_oui_file() {
    exec("wget http://standards.ieee.org/develop/regauth/oui/oui.txt");
}

sub parse_oui_file() {
    $count = 1;

    open(my $fh, '>', 'oui_table.txt');

    open (FILE, './oui.txt');
    while (<FILE>) {
        chomp;
        $val = $_."\n";

        if ($val =~ /base/i) {
            $val =~ s/\(base 16\)//g;
            $mac_address_line = clean_mac($val)."\n";
            @values = split(' ', $mac_address_line);
            $mac_address = $values[0];
            $val =~ s/$mac_address//g;
            if (length($mac_address) == 6) {
                print $fh $mac_address.":::".clean_mac($val)."\n";
                $count++;
            }
        }
    }
    print "mac_address entries found :: ".$count."\n";

    close $fh;
}

sub do_read() {

    if (-e "oui_table.txt") {
        open (FILE, './oui_table.txt');
        while (<FILE>) {
            chomp;
            my @data = split(":::", $_);
            $oui_data{$data[0]} = $data[1];
        }
        close (FILE);
    }

    print("Reading leases from $leases_file\n");

    open(F, $leases_file) or die("Cannot open $leases_file: $!");
    my $content = join('', <F>);
    close(F);
    @all_leases = split(/lease/, $content);

    my $gm_now = strftime("%Y/%m/%d %H:%M:%S", gmtime());
    my %tmp_leases; # for sorting and filtering

    foreach my $lease (@all_leases) {
        next if not ($lease =~ /^\s+([\.\d]+)\s+{.*starts \d+ ([\/\d\ \:]+);.*ends \d+ ([\/\d\ \:]+);.*ethernet ([a-f0-9:]+);(.*client-hostname \"(\S+)\";)*/s);

        next if ($opt_keep eq 'active' and $3 lt $gm_now);

        my $hostname = "NA";
        if ($6) {
            $hostname = $6;
        }

        @lease_values = split("\n", $lease);
        foreach my $val (@lease_values) {
            if ($val =~ /vendor-string/i) {
                $vendor_string = get_lease_value($val);
            }
        }

        my $mac = uc($4);
        my $mac_oid = uc(substr(clean_mac($4), 0, 6));
        my $vendor = "NA";
        if ($oui_data{$mac_oid}) {
            $vendor = $oui_data{$mac_oid};
        }

        my $date_end = $3;

        my %entry = (
            'ip'         => $1,
            'date_begin' => $2,
            'date_end'   => $date_end,
            'mac'        => $mac,
            'hostname'   => $hostname,
            'manu'       => $vendor,
        );

        $entry{'date_begin'} =~ s#\/#-#g; # long live ISO 8601
        $entry{'date_end'} =~ s#\/#-#g;

        if ($opt_keep eq 'all') {
            push(@leases, \%entry);
        }
        elsif (not defined $tmp_leases{$mac} or $tmp_leases{$mac}{'date_end'} gt $date_end) {
            $tmp_leases{$mac} = \%entry;
        }
    }

    # In case we used the hash to filtered
    if (%tmp_leases) {
        foreach (sort keys %tmp_leases) {
            my $h = $tmp_leases{$_};
            push(@leases, $h);
        }
    }

    if ($output_format eq 'human') {
        printf "%-19s%-16s%-15s%-20s%-20s\n", "MAC", "IP", "hostname", "valid until", "manufacturer";
        print("===============================================================================================\n");
    }
    foreach (@leases) {
        if ($output_format eq 'human') {
            printf("%-19s%-16s%-14.14s %-20s%-20s\n",
                $_->{'mac'}, # MAC
                $_->{'ip'}, # IP address
                $_->{'hostname'}, # hostname
                $_->{'date_end'}, # Date
                $_->{'manu'}    # manufactor name
            );
        }
        else {
            printf("%s::%s::%s::%s::%s::%s\n",
                $_->{'mac'},
                $_->{'ip'},
                $_->{'hostname'},
                $_->{'date_begin'},
                $_->{'date_end'},
                $_->{'manu'}
            );
        }
    }

}
