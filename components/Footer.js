export default function Footer() {
  return (
                <footer className="footer">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-6">
                                {new Date().getFullYear()} © webadmin.
                            </div>
                            <div className="col-sm-6">
                                <div className="text-sm-end d-none d-sm-block">
                                    Crafted with <i className="mdi mdi-heart text-danger"></i> by <a href="https://themesdesign.in/" target="_blank" className="text-reset">Themesdesign</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>

  );
}
