#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <getopt.h>
#include <string.h>
#include <sys/time.h>
#include <assert.h>
#ifdef WIN32
#else
#include <syslog.h>
#endif
#include <signal.h>

#ifdef CMAKE_BUILD
#include "lws_config.h"
#endif

#include "../lib/libwebsockets.h"

int force_exit = 0;

#define MAX_ECHO_PAYLOAD 1400
#define LOCAL_RESOURCE_PATH INSTALL_DATADIR"/libwebsockets-test-server"

struct per_session_data__echo {
	unsigned char buf[LWS_SEND_BUFFER_PRE_PADDING + MAX_ECHO_PAYLOAD + LWS_SEND_BUFFER_POST_PADDING];
	unsigned int len;
	unsigned int index;
};


int reply(struct libwebsocket *wsi, void* user, void *in, size_t len, char* topic)
{

    char dd[256];
    static double posX = 1.5;
    double posY = 5.5;
    double posZ = 2.0;
    struct per_session_data__echo *pss = (struct per_session_data__echo *)user;
    int n;

    posX += 0.01;
		sprintf(dd, "{\"op\":\"publish\",\"topic\":\"/%s\", \"msg\":{\"posX\":%f, \"posY\":%f, \"posZ\":%f}}", topic, posX, posY, posZ);

   	memcpy(&pss->buf[LWS_SEND_BUFFER_PRE_PADDING], dd, strlen(dd));

    pss->len = strlen(dd);

		n = libwebsocket_write(wsi, &pss->buf[LWS_SEND_BUFFER_PRE_PADDING], strlen(dd), LWS_WRITE_TEXT);
		if (n < 0) {
			lwsl_err("ERROR %d writing to socket, hanging up\n", n);
			return 1;
		}
		if (n < (int)pss->len) {
			lwsl_err("Partial write\n");
			return -1;
		}


		return 0;
}

static int
callback_echo(struct libwebsocket_context *context,
		struct libwebsocket *wsi,
		enum libwebsocket_callback_reasons reason, void *user,
							   void *in, size_t len)
{
	struct per_session_data__echo *pss = (struct per_session_data__echo *)user;
//	int n;

	//printf("easdf\n");

	switch (reason) {


	/* when the callback is used for server operations --> */

	case LWS_CALLBACK_SERVER_WRITEABLE:
	{
		//printf("writable\n");

		while(1)
		{
		  reply(wsi, user, in, len, "topic");
		  reply(wsi, user, in, len, "topic2");
//    reply(wsi, user, in, len, "topic");
      libwebsocket_service(context, 10);
		  // Sleep(0.5);
		}
/*
    char dd[256];
    double posX = 1.5;
    double posY = 5.5;
    double posZ = 2.0;
		sprintf(dd, "{\"op\":\"publish\",\"topic\":\"/topic\", \"msg\":{\"posX\":%f, \"posY\":%f, \"posZ\":%f}}", posX, posY, posZ);

   	memcpy(&pss->buf[LWS_SEND_BUFFER_PRE_PADDING], dd, strlen(dd));

    pss->len = strlen(dd);

		n = libwebsocket_write(wsi, &pss->buf[LWS_SEND_BUFFER_PRE_PADDING], strlen(dd), LWS_WRITE_TEXT);
		if (n < 0) {
			lwsl_err("ERROR %d writing to socket, hanging up\n", n);
			return 1;
		}
		if (n < (int)pss->len) {
			lwsl_err("Partial write\n");
			return -1;
		}

		break;
		*/
  }
	case LWS_CALLBACK_RECEIVE:
		if (len > MAX_ECHO_PAYLOAD) {
			lwsl_err("Server received packet bigger than %u, hanging up\n", MAX_ECHO_PAYLOAD);
			return 1;
		}
		memcpy(&pss->buf[LWS_SEND_BUFFER_PRE_PADDING], in, len);
		pss->len = (unsigned int)len;


    char string[256];
    int i;
    for (i = 0; i < len; ++i)
    {
      string[i] = ((char *)in)[i];
    }
    string[len] = '\0';

		libwebsocket_callback_on_writable(context, wsi);


		printf("text ! %s\n", string);


//		printf("text ! %s\n", (char*)in);




		break;


	default:
		//printf("default\n");
		break;
	}

	return 0;
}



static struct libwebsocket_protocols protocols[] = {
	/* first protocol must always be HTTP handler */

	{
		"",		/* name */
		callback_echo,		/* callback */
		sizeof(struct per_session_data__echo)	/* per_session_data_size */
	},
	{
		NULL, NULL, 0		/* End of list */
	}
};

void sighandler(int sig)
{
	force_exit = 1;
}

static struct option options[] = {
	{ "help",	no_argument,		NULL, 'h' },
	{ "debug",	required_argument,	NULL, 'd' },
	{ "port",	required_argument,	NULL, 'p' },
	{ "ssl",	no_argument,		NULL, 's' },
	{ "interface",  required_argument,	NULL, 'i' },
#ifndef LWS_NO_DAEMONIZE
	{ "daemonize", 	no_argument,		NULL, 'D' },
#endif
	{ NULL, 0, 0, 0 }
};

int main(int argc, char **argv)
{
	int n = 0;
	int port = 7681;
	int use_ssl = 0;
	struct libwebsocket_context *context;
	int opts = 0;
	char interface_name[128] = "";
	const char *interface = NULL;
#ifndef WIN32
	int syslog_options = LOG_PID | LOG_PERROR;
#endif
	int client = 0;
	int listen_port;
	struct lws_context_creation_info info;


	int debug_level = 7;
#ifndef LWS_NO_DAEMONIZE
	int daemonize = 0;
#endif

	memset(&info, 0, sizeof info);

	lwsl_notice("Built to support server operations\n");

	while (n >= 0) {
		n = getopt_long(argc, argv, "i:hsp:d:D"
				, options, NULL);
		if (n < 0)
			continue;
		switch (n) {
#ifndef LWS_NO_DAEMONIZE
		case 'D':
			daemonize = 1;
#ifndef WIN32
			syslog_options &= ~LOG_PERROR;
#endif
			break;
#endif
		case 'd':
			debug_level = atoi(optarg);
			break;
		case 's':
			use_ssl = 1; /* 1 = take care about cert verification, 2 = allow anything */
			break;
		case 'p':
			port = atoi(optarg);
			break;
		case 'i':
			strncpy(interface_name, optarg, sizeof interface_name);
			interface_name[(sizeof interface_name) - 1] = '\0';
			interface = interface_name;
			break;
		case '?':
		case 'h':
			fprintf(stderr, "Usage: libwebsockets-test-echo "
					"[--ssl] "
					"[--port=<p>] "
					"[-d <log bitfield>]\n");
			exit(1);
		}
	}

#ifndef LWS_NO_DAEMONIZE
	/*
	 * normally lock path would be /var/lock/lwsts or similar, to
	 * simplify getting started without having to take care about
	 * permissions or running as root, set to /tmp/.lwsts-lock
	 */
	if (!client && daemonize && lws_daemonize("/tmp/.lwstecho-lock")) {
		fprintf(stderr, "Failed to daemonize\n");
		return 1;
	}
#endif

#ifdef WIN32
#else
	/* we will only try to log things according to our debug_level */
	setlogmask(LOG_UPTO (LOG_DEBUG));
	openlog("lwsts", syslog_options, LOG_DAEMON);

	/* tell the library what debug level to emit and to send it to syslog */
	lws_set_log_level(debug_level, lwsl_emit_syslog);
#endif

	lwsl_notice("Running in server mode\n");
	listen_port = port;



	info.port = listen_port;
	info.iface = interface;
	info.protocols = protocols;
#ifndef LWS_NO_EXTENSIONS
	info.extensions = libwebsocket_get_internal_extensions();
#endif
	if (use_ssl && !client) {
		info.ssl_cert_filepath = LOCAL_RESOURCE_PATH"/libwebsockets-test-server.pem";
		info.ssl_private_key_filepath = LOCAL_RESOURCE_PATH"/libwebsockets-test-server.key.pem";
	}
	info.gid = -1;
	info.uid = -1;
	info.options = opts;

	context = libwebsocket_create_context(&info);

	if (context == NULL) {
		lwsl_err("libwebsocket init failed\n");
		return -1;
	}

	signal(SIGINT, sighandler);

	n = 0;
	while (n >= 0 && !force_exit) {
		n = libwebsocket_service(context, 10);
	}
	libwebsocket_context_destroy(context);

	lwsl_notice("libwebsockets-test-echo exited cleanly\n");
#ifdef WIN32
#else
	closelog();
#endif

	return 0;
}
