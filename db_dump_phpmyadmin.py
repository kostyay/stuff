#----------------------------------------------------------------#
# This script downloads an SQL dump from phpMyAdmin
# Author: Kostya Yegorov (www.skycure.com)
#----------------------------------------------------------------#

# Imports
import sys
import os
import urllib2
import cookielib
import urllib
import re

# Classes
class PhpMyAdmin(object):
	def __init__(self, phpmyadmin_srv, user, pwd, dbhost, dbname):
		self._phpmyadmin_server = phpmyadmin_srv
		self._user = user
		self._pass = pwd
		self._dbhost = dbhost
		self._dbname = dbname
		self._cookies = cookielib.CookieJar()
		self._opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(self._cookies))
		self._opener.open(self._phpmyadmin_server)
		self._tables = []
		urllib2.install_opener(self._opener)

	def login(self):
		print "Logging in to %s" % (self._phpmyadmin_server, )

		login_request = {'user' : self._user, 'password' : self._pass, 'host' : self._dbhost}
		request =  urllib2.Request('%s/signon.php' % self._phpmyadmin_server, urllib.urlencode(login_request))

		response = urllib2.urlopen(request)
		responseData = response.read()

		# get the token
		self._token = re.findall('.+phpmyadmin\.css\.php\?server=1&amp;token=([0-9a-zA-Z]+)&', responseData)[0]

	def _get_between(self, data, start_text, end_text):
		start_index = data.find(start_text) + len(start_text)
		end_index = data.find(end_text, start_index)

		return data[start_index: end_index]

	def _get_tables(self):
		if len(self._tables) != 0:
			return False

		print "Getting tables list"

		request_params = {'db' : self._dbname}

		request = urllib2.Request('%s/db_export.php' % self._phpmyadmin_server, urllib.urlencode(request_params))
		response = urllib2.urlopen(request)

		responseData = response.read()

		tables_text = self._get_between(responseData, """<select name="table_select[]" id="table_select" size="10" multiple="multiple">""", "</select>")
		self._tables = re.findall("<option value=\"(.+)\" selected.+", tables_text)

		print "Total tables: %d" % (len(self._tables),)

		return len(self._tables) > 0


	def export_db(self, output_fname, add_drop_table = False):
		if not self._get_tables():
			raise Exception("Failed to get table list")

		print "Exporting data.."
		export_request = {
							'token' : self._token,
							'db' : self._dbname,
							'export_type' : 'database',
							'export_method' : 'quick',
							'quick_or_custom' : 'custom',
							'output_format' : 'sendit',
							'charset_of_file' : 'utf-8',
							'compression' : 'none',
							'what' : 'sql',
							'codegen_structure_or_data' : 'data',
							'csv_structure_or_data' : 'data',
							'json_structure_or_data' : 'data',
							'excel_structure_or_data' : 'data',
							'htmlword_structure_or_data' : 'structure_and_data',
							'latex_data' : 'something',
							'mediawiki_structure_or_data' : 'data',
							'ods_structure_or_data' : 'structure_and_data',
							'odt_data' : 'something',
							'pdf_data' : '1',
							'php_array_structure_or_data' : 'data',
							'sql_header_comment' : '',
							'sql_include_comments' : 'something',
							'sql_compatibility' : 'NONE',
							'sql_structure_or_data' : 'structure_and_data',
							'sql_if_not_exists' : 'something',
							'sql_auto_increment' : 'something',
							'sql_backquotes' : 'something',
							'sql_data' : 'something',
							'sql_columns' : 'something',
							'sql_extended' : 'something',
							'sql_max_query_size' : '50000',
							'sql_hex_for_blob' : 'something',
							'sql_type' : 'INSERT',
							'sql_insert_syntax' : 'both',
							'texytext_data' : 'something',
							'xls_structure_or_data' : 'data',
							'xlsx_structure_or_data' : 'data',
							'yaml_structure_or_data' : 'data',
							'asfile' : 'sendit',
							'filename_template' : '@DATABASE@',
							'remember_template' : 'on',
						}
		if add_drop_table:
			export_request['sql_drop_table'] = 'true'


		request = urllib2.Request('%s/export.php' % self._phpmyadmin_server, "%s&%s" % (urllib.urlencode(export_request), "&".join(["table_select[]=" + i for i in self._tables])))
		response = urllib2.urlopen(request)

		responseData = ''
		while 1:
			try:
				data = response.read(1024)
				if not data:
					break
				responseData += data
			except:
				break

		print "Done, size=%d" % len(responseData)
		file(output_fname, "w+").write(responseData)
		print "Saved dump to %s" % (output_fname,)


# Functions
def main():
	try:
		progname, phpmyadmin_addr, user, pwd, dbhost, dbname, dumpfile = sys.argv
	except:
		print "Usage: %s <phpmyadmin_addr> <username> <password> <dbhost> <dbname> <dumpfile>" % (os.path.basename(sys.argv[0]))
		return 1


	c = PhpMyAdmin(phpmyadmin_addr, user, pwd, dbhost, dbname)
	c.login()
	c.export_db(dumpfile, True)		

	return 0

# Main entry point
if "__main__" == __name__:
	sys.exit(main())
