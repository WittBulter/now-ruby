# just for test
require 'webrick'


class Handler < WEBrick::HTTPServlet::AbstractServlet
  def do_GET req, res
    res.body = '1'
  end

end
