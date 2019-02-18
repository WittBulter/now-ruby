require 'webrick'

class Handler < WEBrick::HTTPServlet::AbstractServlet
  def do_GET req, res
    res.body = 'hi'
  end
end
